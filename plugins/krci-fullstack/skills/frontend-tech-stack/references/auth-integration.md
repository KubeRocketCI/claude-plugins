# Authentication Integration Guide

Comprehensive guide to authentication architecture, OAuth/OIDC flow, and integration patterns for the KubeRocketCI portal.

## Authentication Architecture

### System Components

**Backend Components**:

- **Keycloak**: Primary user management and identity provider
  - Handles user authentication and authorization
  - Manages user profiles, roles, and groups
  - Provides OAuth 2.0 and OIDC endpoints

- **openid-client**: Open-source library for OAuth connectivity
  - Implements OIDC client functionality
  - Handles token management and validation
  - Provides discovery and metadata retrieval

- **OIDCClient**: Custom wrapper around openid-client
  - Simplifies integration with Keycloak
  - Provides portal-specific configuration
  - Abstracts complex OAuth flows

- **tRPC Auth Procedures**: Type-safe authenticated endpoints
  - Login initiation
  - Callback handling
  - Token refresh
  - Logout

**Frontend Components**:

- **Login Page**: Entry point for authentication
  - Displays login UI
  - Initiates OAuth flow
  - Handles redirects to Keycloak

- **Login Callback Page**: OAuth callback handler
  - Receives authorization code from Keycloak
  - Exchanges code for tokens via backend
  - Establishes user session
  - Redirects to application

- **Session Management**: Persistent authentication state
  - HTTP-only cookies for security
  - Automatic token refresh
  - Session validation on requests

## Complete Authentication Flow

### Phase 1: Login Initiation

**User Action**: User navigates to login page

**Frontend Flow**:

1. Login component renders
2. Component calls tRPC `auth.getAuthUrl` procedure
3. Backend generates Keycloak authorization URL with:
   - Client ID
   - Redirect URI (callback URL)
   - Scope (openid, profile, email)
   - State parameter (CSRF protection)
   - Code challenge (PKCE)

**Frontend Response**:
4. User clicks "Login" button
5. Browser redirects to Keycloak authorization endpoint

**Example Code**:

```typescript
// apps/client/src/pages/Login.tsx
const { data: authUrl } = trpc.auth.getAuthUrl.useQuery();

const handleLogin = () => {
  if (authUrl) {
    window.location.href = authUrl;
  }
};
```

### Phase 2: Keycloak Authorization

**Keycloak Actions**:

1. User presented with Keycloak login screen
2. User enters credentials
3. Keycloak validates credentials
4. User approves application (if first time)
5. Keycloak generates authorization code
6. Keycloak redirects to callback URL with:
   - Authorization code
   - State parameter (for validation)

**URL Example**:

```
https://portal.example.com/auth/callback?code=AUTH_CODE&state=STATE_VALUE
```

### Phase 3: Token Exchange & Session Creation

**Callback Page Flow**:

1. Callback page loads with authorization code in URL
2. Frontend extracts code from query parameters
3. Frontend calls tRPC `auth.callback` procedure with code
4. Backend validates state parameter
5. Backend exchanges authorization code for tokens by calling Keycloak token endpoint
6. Backend receives:
   - Access token (for API authorization)
   - ID token (user identity information)
   - Refresh token (for token renewal)
7. Backend decodes ID token to extract user data
8. Backend creates session record in database with:
   - Session ID (UUID)
   - User ID and profile
   - Tokens (encrypted)
   - Expiration timestamp
9. Backend sets HTTP-only cookie with session ID
10. Backend returns success with user data
11. Frontend redirects to application home page

**Example Code**:

```typescript
// apps/client/src/pages/AuthCallback.tsx
const searchParams = new URLSearchParams(window.location.search);
const code = searchParams.get('code');

const { mutate: handleCallback } = trpc.auth.callback.useMutation({
  onSuccess: (data) => {
    // Session established, user data available
    navigate('/');
  },
  onError: (error) => {
    // Handle authentication failure
  }
});

useEffect(() => {
  if (code) {
    handleCallback({ code });
  }
}, [code]);
```

**Backend Implementation**:

```typescript
// apps/server/src/routers/auth.ts
export const authRouter = createTRPCRouter({
  callback: publicProcedure
    .input(z.object({ code: z.string() }))
    .mutation(async ({ input, ctx }) => {
      // Exchange code for tokens
      const tokens = await oidcClient.exchangeCodeForTokens(input.code);

      // Get user info
      const userInfo = await oidcClient.getUserInfo(tokens.accessToken);

      // Create session
      const sessionId = await sessionService.createSession({
        userId: userInfo.sub,
        tokens,
        userInfo,
      });

      // Set cookie
      ctx.res.setCookie('sessionId', sessionId, {
        httpOnly: true,
        secure: true,
        sameSite: 'strict',
      });

      return { user: userInfo };
    }),
});
```

### Phase 4: Authenticated Requests

**Subsequent API Calls**:

1. User makes request (e.g., load dashboard)
2. Browser automatically includes sessionId cookie
3. Backend middleware intercepts request
4. Middleware validates session:
   - Checks session exists in database
   - Verifies session not expired
   - Retrieves stored tokens
5. Middleware checks token expiration
6. If token expired, middleware uses refresh token to get new access token
7. Middleware attaches user context to request
8. API handler processes request with user context
9. Response returned to client

**Middleware Example**:

```typescript
// apps/server/src/middleware/auth.ts
export const authMiddleware = async (req, res, next) => {
  const sessionId = req.cookies.sessionId;

  if (!sessionId) {
    throw new Error('Not authenticated');
  }

  const session = await sessionService.getSession(sessionId);

  if (!session) {
    throw new Error('Invalid session');
  }

  // Check token expiration
  if (isTokenExpired(session.tokens.accessToken)) {
    // Refresh token
    const newTokens = await oidcClient.refreshTokens(session.tokens.refreshToken);
    await sessionService.updateTokens(sessionId, newTokens);
    session.tokens = newTokens;
  }

  // Attach user to context
  req.user = session.user;
  req.tokens = session.tokens;

  next();
};
```

**Protected Procedure Example**:

```typescript
// apps/server/src/trpc/procedures/protectedProcedure.ts
export const protectedProcedure = publicProcedure.use(async ({ ctx, next }) => {
  if (!ctx.user) {
    throw new TRPCError({ code: 'UNAUTHORIZED' });
  }

  return next({
    ctx: {
      ...ctx,
      user: ctx.user,  // User guaranteed to exist
      tokens: ctx.tokens,
    },
  });
});
```

## Security Features

### HTTP-Only Cookies

**Purpose**: Prevent XSS attacks from accessing session tokens

**Configuration**:

```typescript
ctx.res.setCookie('sessionId', sessionId, {
  httpOnly: true,      // Not accessible via JavaScript
  secure: true,        // HTTPS only
  sameSite: 'strict',  // CSRF protection
  maxAge: 86400000,    // 24 hours
  path: '/',
});
```

**Benefits**:

- JavaScript cannot read or write the cookie
- Protects against XSS-based token theft
- Browser automatically includes cookie in requests

### Session Database

**Purpose**: Centralized session management with secure token storage

**Schema**:

```typescript
interface Session {
  id: string;                    // Session UUID
  userId: string;                // User identifier from Keycloak
  userInfo: {                    // User profile data
    sub: string;
    name: string;
    email: string;
    roles: string[];
    groups: string[];
  };
  tokens: {                      // Encrypted tokens
    accessToken: string;
    idToken: string;
    refreshToken: string;
    expiresAt: number;
  };
  createdAt: Date;
  expiresAt: Date;
}
```

**Storage**: SQLite database (better-sqlite3)

**Benefits**:

- Tokens never sent to client
- Centralized token management
- Easy session invalidation
- Audit trail of sessions

### Token Refresh

**Purpose**: Maintain authentication without re-login

**Flow**:

1. Middleware checks access token expiration
2. If expired, use refresh token to get new access token
3. Update session with new tokens
4. Continue with request using fresh token

**Implementation**:

```typescript
const refreshTokens = async (refreshToken: string) => {
  const response = await fetch(keycloakTokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'refresh_token',
      client_id: clientId,
      refresh_token: refreshToken,
    }),
  });

  const data = await response.json();

  return {
    accessToken: data.access_token,
    idToken: data.id_token,
    refreshToken: data.refresh_token,
    expiresAt: Date.now() + (data.expires_in * 1000),
  };
};
```

**Benefits**:

- Seamless user experience
- No interruption for token expiration
- Maintains security with short-lived access tokens

### Secure Token Storage

**Server-Side Only**: Tokens never exposed to browser

**Encryption**: Tokens encrypted before database storage (optional but recommended)

**Access Control**: Tokens only accessible via server-side code

**Benefits**:

- No token exposure to client-side JavaScript
- Protected against XSS attacks
- Centralized security model

## Integration Patterns

### Frontend: Using Authentication Context

**AuthContext Provider**:

```typescript
// apps/client/src/core/auth/AuthContext.tsx
interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: () => void;
  logout: () => void;
}

export const AuthProvider: React.FC = ({ children }) => {
  const { data: user, isLoading } = trpc.auth.getCurrentUser.useQuery();

  const login = () => {
    window.location.href = '/login';
  };

  const { mutate: logoutMutation } = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = '/login';
    },
  });

  const logout = () => {
    logoutMutation();
  };

  return (
    <AuthContext.Provider
      value={{
        user: user || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
```

**Using Auth in Components**:

```typescript
// Component that requires authentication
const Dashboard: React.FC = () => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) return <LoadingSpinner />;
  if (!isAuthenticated) return <Navigate to="/login" />;

  return <div>Welcome, {user.name}!</div>;
};
```

### Backend: Protected Procedures

**Creating Protected Endpoints**:

```typescript
// apps/server/src/routers/codebases.ts
export const codebaseRouter = createTRPCRouter({
  // Public endpoint (no auth required)
  getPublicInfo: publicProcedure
    .query(async () => {
      return { version: '1.0.0' };
    }),

  // Protected endpoint (auth required)
  list: protectedProcedure
    .query(async ({ ctx }) => {
      // ctx.user guaranteed to exist
      const codebases = await k8sService.listCodebases(ctx.tokens.idToken);
      return codebases;
    }),

  // Protected endpoint with input validation
  create: protectedProcedure
    .input(codebaseSchema)
    .mutation(async ({ ctx, input }) => {
      const codebase = await k8sService.createCodebase(
        input,
        ctx.tokens.idToken
      );
      return codebase;
    }),
});
```

### Kubernetes API Integration

**Using ID Token for K8s API**:

```typescript
// apps/server/src/services/k8s.ts
export class K8sService {
  async listCodebases(idToken: string): Promise<Codebase[]> {
    const kubeConfig = new KubeConfig();
    kubeConfig.loadFromDefault();

    // Use ID token for authentication
    kubeConfig.setCredentials({
      token: idToken,
    });

    const k8sApi = kubeConfig.makeApiClient(CustomObjectsApi);

    const response = await k8sApi.listNamespacedCustomObject(
      'v2.edp.epam.com',
      'v1',
      'default',
      'codebases'
    );

    return response.body.items;
  }
}
```

**Why ID Token**: ID token contains user identity information and is specifically designed for this use case.

### Permission Checking

**Role-Based Access Control (RBAC)**:

```typescript
// Check user roles from Keycloak
const hasRole = (user: User, role: string): boolean => {
  return user.roles.includes(role);
};

// Protected procedure with role check
export const adminRouter = createTRPCRouter({
  deleteCodebase: protectedProcedure
    .input(z.object({ name: z.string() }))
    .mutation(async ({ ctx, input }) => {
      if (!hasRole(ctx.user, 'admin')) {
        throw new TRPCError({
          code: 'FORBIDDEN',
          message: 'Admin role required',
        });
      }

      await k8sService.deleteCodebase(input.name, ctx.tokens.idToken);
    }),
});
```

## Logout Flow

**Frontend Initiation**:

```typescript
const { mutate: logout } = trpc.auth.logout.useMutation({
  onSuccess: () => {
    window.location.href = '/login';
  },
});
```

**Backend Processing**:

```typescript
export const authRouter = createTRPCRouter({
  logout: publicProcedure
    .mutation(async ({ ctx }) => {
      const sessionId = ctx.req.cookies.sessionId;

      if (sessionId) {
        // Delete session from database
        await sessionService.deleteSession(sessionId);

        // Clear cookie
        ctx.res.clearCookie('sessionId');
      }

      return { success: true };
    }),
});
```

## Troubleshooting Common Issues

### Issue: "Session Not Found"

**Cause**: Cookie not being sent with requests

**Solution**:

- Verify cookie configuration (httpOnly, secure, sameSite)
- Check CORS configuration allows credentials
- Ensure frontend sends credentials: `credentials: 'include'`

### Issue: "Token Expired"

**Cause**: Access token expired and refresh failed

**Solution**:

- Verify refresh token is still valid
- Check Keycloak session timeout settings
- Implement proper token refresh logic
- Redirect to login if refresh fails

### Issue: "CORS Error on Auth Callback"

**Cause**: Redirect URL not allowed in Keycloak

**Solution**:

- Add callback URL to Keycloak client's "Valid Redirect URIs"
- Verify URL exactly matches (including protocol and port)

### Issue: "User Not Authenticated" After Login

**Cause**: Session cookie not being set

**Solution**:

- Verify cookie is set in backend response
- Check cookie domain and path settings
- Ensure HTTPS in production (secure flag)
- Verify browser allows third-party cookies if needed

## Summary

- Authentication uses OAuth 2.0 / OIDC with Keycloak
- Session management via HTTP-only cookies and database
- Tokens stored server-side for security
- Automatic token refresh for seamless UX
- Protected procedures enforce authentication
- ID tokens used for Kubernetes API authorization
- RBAC integration through Keycloak roles and groups
