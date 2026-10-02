export type Scope = {
  /** The only kube context Claude may target. */
  context: string
  /** The user's home directory, absolute. */
  home: string
  /** The kubeconfig files the pin is built from, absolute. */
  kubeconfigs: readonly string[]
}

/** The lock's own folder under ~/.kube. */
export const LOCK_DIR_NAME = 'krci-kubelock'

export const EMPTY_KUBECONFIG = `apiVersion: v1
kind: Config
clusters: []
contexts: []
users: []
current-context: ""
preferences: {}
`

const SEGMENT = /\|\||&&|[;&|\n]/
const WORD_END = String.raw`(?=$|[\s;&|)\x60'"])`
const KUBE_TOOL = new RegExp(
  String.raw`(?:^|[\s/(\x60'"])(?:kubectl|kubecolor|helm|helmfile|k9s|kubectx|kubens|kubie|tkn|krci|flux|stern|argocd|skaffold)` +
    WORD_END,
)
const K_ALIAS = /^\s*k\s/
const KIND_WRITES_CONTEXT = /(?:^|[\s/(`])kind\s+(?:create\s+cluster|export\s+kubeconfig)\b/
const KIND_ANY = /(?:^|[\s/(`])kind\s+(?:create|delete|export|get|load)\b/

const NESTED_SHELL = /(?:^|[\s/(`])(?:ba|z|k|da)?sh\s+(?:-\w+\s+)*-\w*c\s+(['"])([\s\S]*?)\1/g
const SHELL_KEYWORDS = new Set(['if', 'then', 'else', 'elif', 'do', 'while', 'until', '!', 'time', 'nohup', 'exec', 'command', 'builtin'])
const ENV_WRITERS = new Set(['export', 'declare', 'typeset', 'local', 'readonly', 'env', 'sudo', 'unset'])
const ASSIGNMENT = /^[A-Za-z_]\w*\+?=/
const KUBECONFIG_WORD = /^(?:--unset=|-u)?KUBECONFIG(?:\+?=.*)?$/
const KUBECONFIG_FLAG = /(?:^|\s)--kubeconfig(?:[=\s]|$)/
const CREDENTIAL_FETCHERS = [
  /\baws\s+eks\s+update-kubeconfig\b/,
  /\bgcloud\s+container\s+clusters\s+get-credentials\b/,
  /\baz\s+aks\s+get-credentials\b/,
  /\bdoctl\s+kubernetes\s+cluster\s+kubeconfig\s+save\b/,
]
const HELM_CONTEXT_ENV = /(?<![\w$])HELM_KUBECONTEXT\s*=\s*(\S+)/
const SETTING_KEY = /\bkubelock/
const SETTINGS_FILE = /(?:^|\/)settings(?:\.local)?\.json$/
const KUBE_DIR_OPEN = new Set([LOCK_DIR_NAME, 'cache', 'http-cache'])
const KUBE_DIR_CHILD = /^\/([^\s/'"`;|&)]+)/

/** A KUBECONFIG value without entries inside the lock's own folder; null when none remain. */
export function withoutLockFiles(kubeconfig: string, lockDir: string): string | null {
  const kept = kubeconfig.split(':').filter(entry => entry !== '' && entry !== lockDir && !entry.startsWith(`${lockDir}/`))
  return kept.length === 0 ? null : kept.join(':')
}

/** The pinned kubeconfig's file name for a context. */
export function pinnedFileName(context: string): string {
  return `${context.replace(/[^\w.-]/g, '_')}.yaml`
}

/** Whether a shell command runs a Kubernetes client. */
export function isKubeCommand(command: string): boolean {
  return command.split(SEGMENT).some(isKubeSegment)
}

function isKubeSegment(segment: string): boolean {
  return KUBE_TOOL.test(segment) || K_ALIAS.test(segment) || KIND_ANY.test(segment)
}

/** Whether a segment assigns, exports or unsets KUBECONFIG, as opposed to merely naming it. */
function writesKubeconfig(segment: string): boolean {
  const words = segment.trim().replace(/^[({`$]+/, '').split(/\s+/)
  let index = 0
  while (index < words.length && SHELL_KEYWORDS.has(words[index] ?? '')) {
    index += 1
  }
  while (index < words.length && ASSIGNMENT.test(words[index] ?? '')) {
    if (/^KUBECONFIG\+?=/.test(words[index] ?? '')) {
      return true
    }
    index += 1
  }
  const program = (words[index] ?? '').split('/').pop() ?? ''
  return ENV_WRITERS.has(program) && words.slice(index + 1).some(word => KUBECONFIG_WORD.test(word))
}

/** Why a Bash command breaks the pin, or undefined when it may run. */
export function checkCommand(command: string, scope: Scope): string | undefined {
  if (SETTING_KEY.test(command) && /settings(?:\.local)?\.json|pluginConfigs/.test(command)) {
    return 'the krci-kubelock settings belong to the user; change them in /config'
  }
  for (const nested of command.matchAll(NESTED_SHELL)) {
    const reason = checkCommand(nested[2] ?? '', scope)
    if (reason !== undefined) {
      return reason
    }
  }
  const segments = command.split(SEGMENT)
  if (segments.some(writesKubeconfig)) {
    return `KUBECONFIG is pinned to ${scope.context}; overriding or unsetting it is blocked`
  }
  if (segments.some(segment => isKubeSegment(segment) && KUBECONFIG_FLAG.test(segment))) {
    return `--kubeconfig is blocked; kubectl and helm already use the pinned ${scope.context} kubeconfig`
  }
  const kubeDir = kubeDirMention(command, scope.home)
  if (kubeDir !== undefined) {
    return `${kubeDir} is off limits: ~/.kube holds kubeconfigs for contexts other than ${scope.context}`
  }
  const spelled = kubeconfigSpellings(scope).find(path => command.includes(path))
  if (spelled !== undefined) {
    return `${spelled} is off limits: it holds contexts other than ${scope.context}`
  }
  if (CREDENTIAL_FETCHERS.some(pattern => pattern.test(command))) {
    return `fetching cluster credentials is blocked; only ${scope.context} is allowed`
  }
  const helmContext = HELM_CONTEXT_ENV.exec(command)?.[1]
  const targets = [...(helmContext === undefined ? [] : [helmContext]), ...segments.flatMap(segmentTargets)].map(
    unquote,
  )
  const foreign = targets.find(target => target !== scope.context)
  if (foreign !== undefined) {
    return `only context ${scope.context} is allowed; this command targets ${foreign}`
  }
  return undefined
}

/** Why a file tool may not touch a path, or undefined when it may. */
export function checkPath(path: string, scope: Scope): string | undefined {
  const absolute = path === '~' || path.startsWith('~/') ? scope.home + path.slice(1) : path
  const normal = absolute.startsWith('/') ? normalizePath(absolute) : absolute
  const kubeDir = `${scope.home}/.kube`
  if (normal === kubeDir || normal.startsWith(`${kubeDir}/`)) {
    const child = normal.slice(kubeDir.length + 1).split('/')[0] ?? ''
    if (!KUBE_DIR_OPEN.has(child)) {
      return `${path} is off limits: ~/.kube holds kubeconfigs for contexts other than ${scope.context}`
    }
  }
  return realKubeconfigs(scope).includes(normal)
    ? `${path} is off limits: it holds contexts other than ${scope.context}`
    : undefined
}

/** The first spelling of a ~/.kube path in a command outside the lock's folder and kubectl's caches. */
function kubeDirMention(command: string, home: string): string | undefined {
  const prefixes = ['~', '$HOME', '${HOME}', ...(home === '' ? [] : [home])].map(root => `${root}/.kube`)
  for (const prefix of prefixes) {
    for (let at = command.indexOf(prefix); at !== -1; at = command.indexOf(prefix, at + prefix.length)) {
      const rest = command.slice(at + prefix.length)
      if (/^[\w.-]/.test(rest)) {
        continue
      }
      const child = KUBE_DIR_CHILD.exec(rest)?.[1]
      const next = child === undefined ? '' : rest.slice(child.length + 1)
      if (child === undefined || !KUBE_DIR_OPEN.has(child) || /^\/\.\.(?:\/|$)/.test(next)) {
        return child === undefined ? prefix : `${prefix}/${child}`
      }
    }
  }
  return undefined
}

/** Whether a file edit changes a krci-kubelock setting in a settings file. */
export function touchesKubelockSetting(path: string, text: string): boolean {
  return SETTINGS_FILE.test(path) && SETTING_KEY.test(text)
}

function segmentTargets(segment: string): string[] {
  const targets: string[] = []
  for (const match of segment.matchAll(/(?:^|\s)--kube-context(?:=|\s+)(\S+)/g)) {
    targets.push(match[1] ?? '')
  }
  if (KUBE_TOOL.test(segment) || K_ALIAS.test(segment)) {
    for (const match of segment.matchAll(/(?:^|\s)--context(?:=|\s+)(\S+)/g)) {
      targets.push(match[1] ?? '')
    }
    const used = /\bconfig\s+use(?:-context)?\s+(\S+)/.exec(segment)?.[1]
    if (used !== undefined) {
      targets.push(used)
    }
  }
  const switched = /(?:^|[\s/(`])kubectx\s+(\S+)/.exec(segment)?.[1]
  if (switched !== undefined && (switched === '-' || !(switched.startsWith('-') || switched.includes('=')))) {
    targets.push(switched)
  }
  const kubie = /(?:^|[\s/(`])kubie\s+(?:ctx|exec)\s+(\S+)/.exec(segment)?.[1]
  if (kubie !== undefined) {
    targets.push(kubie)
  }
  if (KIND_WRITES_CONTEXT.test(segment)) {
    const name = /(?:^|\s)--name(?:=|\s+)(\S+)/.exec(segment)?.[1]
    targets.push(`kind-${name === undefined ? 'kind' : unquote(name)}`)
  }
  return targets
}

function realKubeconfigs(scope: Scope): string[] {
  return [...new Set([...scope.kubeconfigs, `${scope.home}/.kube/config`])]
}

function kubeconfigSpellings(scope: Scope): string[] {
  return realKubeconfigs(scope).flatMap(file => {
    if (scope.home === '' || !file.startsWith(`${scope.home}/`)) {
      return [file]
    }
    const rest = file.slice(scope.home.length)
    return [file, `~${rest}`, `$HOME${rest}`, `\${HOME}${rest}`]
  })
}

function normalizePath(path: string): string {
  const parts: string[] = []
  for (const part of path.split('/')) {
    if (part === '..') {
      parts.pop()
    } else if (part !== '' && part !== '.') {
      parts.push(part)
    }
  }
  return `/${parts.join('/')}`
}

function unquote(value: string): string {
  return value.replace(/^['"]|['"]$/g, '')
}
