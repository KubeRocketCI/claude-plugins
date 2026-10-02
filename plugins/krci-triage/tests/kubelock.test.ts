import { describe, expect, test } from 'claude-code/testing'

import {
  checkCommand,
  checkPath,
  isKubeCommand,
  pinnedFileName,
  touchesKubelockSetting,
  withoutLockFiles,
  type Scope,
} from '../hooks/kubelock'

const scope: Scope = {
  context: 'kind-krci',
  home: '/home/dev',
  kubeconfigs: ['/home/dev/.kube/config', '/home/dev/work/eks.yaml'],
}

describe('checkCommand allows', () => {
  const allowed = [
    'kubectl get pods -n krci',
    'kubectl --context kind-krci get ns',
    'kubectl get ns --context=kind-krci',
    "kubectl --context 'kind-krci' get ns",
    'helm --kube-context kind-krci list -A',
    'kubectl config use-context kind-krci',
    'kubectl config get-contexts',
    'kubectl config set-context --current --namespace=krci',
    'kubectx',
    'kubectx kind-krci',
    'kubectx -c',
    'echo $KUBECONFIG',
    'echo "KUBECONFIG=$KUBECONFIG"',
    'echo KUBECONFIG=$KUBECONFIG; kubectl config get-contexts -o name',
    '[[ "$KUBECONFIG" == *krci* ]] && echo pinned',
    'rg "KUBECONFIG=" sources/edp-tekton',
    'rg -- --kubeconfig sources/edp-codebase-operator',
    "bash -lc 'kubectl get po -n krci'",
    'docker --context colima ps',
    'cd /home/dev/krci-workspace/sources/krci-portal && pnpm test',
    'git -C /home/dev/krci-workspace/sources/krci-cache log --oneline',
    'kind create cluster --name krci --config kind.yaml',
    'kind load docker-image operator:dev --name krci',
    'kind delete cluster --name scratch',
    'cat ~/.kube/krci-kubelock/kind-krci.yaml',
    'ls -la ~/.kube/krci-kubelock/',
    'du -sh ~/.kube/cache ~/.kube/http-cache',
    'ls ~/.kube-backups',
    'rg kubelock sources/claude-plugins',
    'make stand-up',
  ]
  for (const command of allowed) {
    test(command, () => {
      expect(checkCommand(command, scope)).toBeUndefined()
    })
  }
})

describe('checkCommand denies', () => {
  const denied: Array<[string, string]> = [
    ['kubectl --context ctp-prod-euc1-blue-eks get po', 'targets ctp-prod-euc1-blue-eks'],
    ['kubectl get po --context=ctp-qa-eus1-green-eks', 'targets ctp-qa-eus1-green-eks'],
    ['k --context prod get po', 'targets prod'],
    ['kubectl get po --context "$CTX"', 'targets $CTX'],
    ['watch -n 5 kubectl --context prod get po', 'targets prod'],
    ['helm --kube-context prod list', 'targets prod'],
    ['HELM_KUBECONTEXT=prod helm list', 'targets prod'],
    ['kubectl config use-context prod', 'targets prod'],
    ['kubectl config use prod', 'targets prod'],
    ['kubectx prod', 'targets prod'],
    ['kubectx -', 'targets -'],
    ['kubie ctx prod', 'targets prod'],
    ['kind create cluster --name scratch', 'targets kind-scratch'],
    ['kind export kubeconfig', 'targets kind-kind'],
    ['KUBECONFIG=/tmp/other kubectl get po', 'KUBECONFIG is pinned'],
    ['export KUBECONFIG=/tmp/other', 'KUBECONFIG is pinned'],
    ['KUBECONFIG+=:/tmp/other', 'KUBECONFIG is pinned'],
    ['unset KUBECONFIG; kubectl get po', 'KUBECONFIG is pinned'],
    ['env -u KUBECONFIG kubectl get po', 'KUBECONFIG is pinned'],
    ['env KUBECONFIG=/tmp/other kubectl get po', 'KUBECONFIG is pinned'],
    ['sudo KUBECONFIG=/tmp/other kubectl get po', 'KUBECONFIG is pinned'],
    ['(KUBECONFIG=/tmp/other kubectl get po)', 'KUBECONFIG is pinned'],
    ['if true; then KUBECONFIG=/tmp/other kubectl get po; fi', 'KUBECONFIG is pinned'],
    ["bash -c 'KUBECONFIG=/tmp/other kubectl get po'", 'KUBECONFIG is pinned'],
    [`zsh -lc "kubectl --context prod get po"`, 'targets prod'],
    ['kubectl --kubeconfig /tmp/other get po', '--kubeconfig is blocked'],
    ['helm list --kubeconfig=/tmp/other', '--kubeconfig is blocked'],
    ['cat ~/.kube/config', '~/.kube/config is off limits'],
    ['cp $HOME/.kube/config /tmp/c', '$HOME/.kube/config is off limits'],
    ['grep server ${HOME}/.kube/config', '${HOME}/.kube/config is off limits'],
    ['cat /home/dev/.kube/config', '/home/dev/.kube/config is off limits'],
    ['cat ~/work/eks.yaml', '~/work/eks.yaml is off limits'],
    ['ls -la ~/.kube', '~/.kube is off limits'],
    ['ls ~/.kube/', '~/.kube is off limits'],
    ['cat ~/.kube/backup-config', '~/.kube/backup-config is off limits'],
    ['cp ~/.kube/civo-demo-kubeconfig /tmp/x', '~/.kube/civo-demo-kubeconfig is off limits'],
    ['cat ~/.kube/*', '~/.kube/* is off limits'],
    ['cat ~/.kube/cache/../config', '~/.kube/cache is off limits'],
    ['cat /home/dev/.kube/backup-config', '/home/dev/.kube/backup-config is off limits'],
    ['aws eks update-kubeconfig --name prod', 'fetching cluster credentials'],
    ['gcloud container clusters get-credentials prod', 'fetching cluster credentials'],
    ['az aks get-credentials -g rg -n prod', 'fetching cluster credentials'],
    [
      `jq '.pluginConfigs["krci-triage@kuberocketci-plugins"].options.kubelock=false' ~/.claude/settings.json`,
      'settings belong to the user',
    ],
  ]
  for (const [command, reason] of denied) {
    test(command, () => {
      expect(checkCommand(command, scope)).toContain(reason)
    })
  }
})

describe('checkPath', () => {
  test('denies the real kubeconfig files', () => {
    expect(checkPath('/home/dev/.kube/config', scope)).toContain('off limits')
    expect(checkPath('~/.kube/config', scope)).toContain('off limits')
    expect(checkPath('/home/dev//.kube/./config', scope)).toContain('off limits')
    expect(checkPath('/home/dev/work/eks.yaml', scope)).toContain('off limits')
  })

  test('denies everything else under ~/.kube', () => {
    expect(checkPath('/home/dev/.kube', scope)).toContain('off limits')
    expect(checkPath('/home/dev/.kube/', scope)).toContain('off limits')
    expect(checkPath('/home/dev/.kube/backup-config', scope)).toContain('off limits')
    expect(checkPath('/home/dev/.kube/cache/../config', scope)).toContain('off limits')
    expect(checkPath('/home/dev/work/../.kube/civo-demo-kubeconfig', scope)).toContain('off limits')
  })

  test('allows the lock folder, the kubectl caches and everything else', () => {
    expect(checkPath('/home/dev/.kube/krci-kubelock/kind-krci.yaml', scope)).toBeUndefined()
    expect(checkPath('/home/dev/.kube/cache/discovery/servergroups.json', scope)).toBeUndefined()
    expect(checkPath('/home/dev/krci-workspace/README.md', scope)).toBeUndefined()
  })
})

describe('withoutLockFiles', () => {
  const lockDir = '/home/dev/.kube/krci-kubelock'

  test('drops entries inside the lock folder', () => {
    expect(withoutLockFiles(`${lockDir}/kind-krci.yaml`, lockDir)).toBeNull()
    expect(withoutLockFiles(`/home/dev/.kube/config:${lockDir}/kind-krci.yaml`, lockDir)).toBe('/home/dev/.kube/config')
  })

  test('keeps everything else', () => {
    expect(withoutLockFiles('/home/dev/work/eks.yaml:/home/dev/.kube/config', lockDir)).toBe(
      '/home/dev/work/eks.yaml:/home/dev/.kube/config',
    )
  })
})

describe('touchesKubelockSetting', () => {
  test('flags a settings edit that names a krci-kubelock key', () => {
    expect(touchesKubelockSetting('/home/dev/.claude/settings.json', '"kubelock": false')).toBe(true)
    expect(touchesKubelockSetting('/home/dev/.claude/settings.json', '"kubelockContext": "prod"')).toBe(true)
    expect(touchesKubelockSetting('/home/dev/.claude/settings.local.json', '"kubelock": false')).toBe(true)
  })

  test('ignores other files and other settings', () => {
    expect(touchesKubelockSetting('/repo/plugins/krci-triage/README.md', 'kubelock')).toBe(false)
    expect(touchesKubelockSetting('/home/dev/.claude/settings.json', '"theme": "dark"')).toBe(false)
  })
})

describe('isKubeCommand', () => {
  test('spots kube clients', () => {
    expect(isKubeCommand('kubectl get po')).toBe(true)
    expect(isKubeCommand('cd /tmp && helm list')).toBe(true)
    expect(isKubeCommand('/usr/local/bin/kubectl version')).toBe(true)
    expect(isKubeCommand('k get po')).toBe(true)
    expect(isKubeCommand('kind load docker-image x --name krci')).toBe(true)
  })

  test('ignores paths and words that only contain a client name', () => {
    expect(isKubeCommand('ls /home/dev/krci-workspace/sources/krci-portal')).toBe(false)
    expect(isKubeCommand('grep "kind: Deployment" chart.yaml')).toBe(false)
    expect(isKubeCommand('git status')).toBe(false)
  })
})

test('pinnedFileName keeps the name file-safe', () => {
  expect(pinnedFileName('kind-krci')).toBe('kind-krci.yaml')
  expect(pinnedFileName('arn:aws:eks/prod')).toBe('arn_aws_eks_prod.yaml')
})
