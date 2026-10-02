export type KubelockOrigin = {
  /** True while KUBECONFIG points at the pinned file. */
  isPinned: boolean
  /** KUBECONFIG as the session started with it; null when unset. */
  kubeconfig: string | null
}

declare module 'claude-code' {
  interface PluginState {
    'krci-triage': { kubelockOrigin: KubelockOrigin }
  }
}
