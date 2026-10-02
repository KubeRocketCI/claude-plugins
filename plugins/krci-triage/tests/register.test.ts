import type { On } from 'claude-code'
import { describe, expect, mock, test } from 'claude-code/testing'

const HOME = '/home/dev'
const REAL = `${HOME}/.kube/config`
const PINNED = `${HOME}/.kube/krci-kubelock/kind-krci.yaml`
const KIND_ONLY = 'apiVersion: v1\nkind: Config\ncontexts:\n- name: kind-krci\ncurrent-context: kind-krci\n'
const WITH_PROD = `${KIND_ONLY}- name: ctp-prod-euc1-blue-eks\n`

type World = {
  files: Map<string, string>
  env: Map<string, string | undefined>
  ran: string[]
  status: Array<string | undefined>
  toasts: string[]
}

/** Stands in for the machine beneath the plugin: files, env, kubectl, sh and the Bash tool. */
function world(on: On, realKubeconfig: string | undefined): World {
  const w: World = {
    files: new Map(realKubeconfig === undefined ? [] : [[REAL, realKubeconfig]]),
    env: new Map([['HOME', HOME]]),
    ran: [],
    status: [],
    toasts: [],
  }
  const done = (stdout: string, exitCode = 0) => ({
    value: { exitCode, stdout, stderr: exitCode === 0 ? '' : 'error', isStdoutTruncated: false, isStderrTruncated: false },
  })

  mock.clock(on, { now: 1_000_000 })
  on('env.get', async (_$, e) => ({ value: w.env.get(e.name) }))
  on('env.set', async (_$, e) => {
    w.env.set(e.name, e.value)
    return { value: undefined }
  })
  on('session.id', async () => ({ value: 'test-session' }))
  on('ui.status', async (_$, e) => {
    w.status.push(e.text)
    return { value: undefined }
  })
  on('ui.toast', async (_$, e) => {
    w.toasts.push(e.text)
    return { value: undefined }
  })
  on('command.register', async (_$, e) => ({ value: { command: e.name } }))
  on('fs.exists', async (_$, e) => ({ value: w.files.has(e.path) }))
  on('fs.read', async (_$, e) => {
    const text = w.files.get(e.path)
    return text === undefined ? { deny: `missing ${e.path}` } : { value: text }
  })
  on('process.run', async (_$, e) => {
    const [tool, ...args] = e.argv
    if (tool === 'kubectl') {
      const source = w.files.get(e.init?.env?.KUBECONFIG ?? '') ?? ''
      return source.includes('name: kind-krci') ? done(KIND_ONLY) : done('', 1)
    }
    if (tool === 'sh') {
      w.files.set(args[5] ?? '', e.init?.stdin ?? '')
      return done('')
    }
    return done('', 127)
  })
  on('tool.call', async (_$, e) => {
    if (e.tool === 'Bash') {
      w.ran.push(e.command)
      if (e.command.startsWith('kind create cluster')) {
        w.files.set(PINNED, WITH_PROD)
      }
    }
    return { result: { stdout: '', stderr: '', interrupted: false } }
  })
  return w
}

const ON = { options: { kubelock: true } }

describe('lock on', () => {
  test('pins KUBECONFIG to a kubeconfig holding only the allowed context', ON, async ($, on) => {
    const w = world(on, WITH_PROD)
    await $.tool.call({ tool: 'Bash', command: 'kubectl get pods -n krci' })

    expect(w.env.get('KUBECONFIG')).toBe(PINNED)
    expect(w.files.get(PINNED)).toBe(KIND_ONLY)
    expect(w.ran).toEqual(['kubectl get pods -n krci'])
    expect(w.status.at(-1)).toBe('⎈ kind-krci 🔒')
  })

  test('denies a command that targets another context', ON, async ($, on) => {
    const w = world(on, WITH_PROD)
    const ran = await $.tool.call({ tool: 'Bash', command: 'kubectl --context ctp-prod-euc1-blue-eks get po' })

    expect(ran.deny).toContain('only context kind-krci is allowed')
    expect(w.ran).toEqual([])
  })

  test('denies a file tool on the real kubeconfig', ON, async ($, on) => {
    world(on, WITH_PROD)
    const ran = await $.tool.call({ tool: 'Read', file_path: REAL })

    expect(ran.deny).toContain('off limits')
  })

  test('fails closed when the allowed context is missing', ON, async ($, on) => {
    const w = world(on, undefined)
    await $.tool.call({ tool: 'Bash', command: 'kubectl get ns' })

    expect(w.env.get('KUBECONFIG')).toBe(PINNED)
    expect(w.files.get(PINNED)).toContain('contexts: []')
    expect(w.status.at(-1)).toBe('⎈ kind-krci missing · kube access blocked')
  })

  test('strips contexts a command added to the pinned file', ON, async ($, on) => {
    const w = world(on, WITH_PROD)
    await $.tool.call({ tool: 'Bash', command: 'kind create cluster --name krci' })

    expect(w.ran).toEqual(['kind create cluster --name krci'])
    expect(w.files.get(PINNED)).toBe(KIND_ONLY)
  })

  test('ignores a KUBECONFIG that already points into the lock folder', ON, async ($, on) => {
    const w = world(on, WITH_PROD)
    w.env.set('KUBECONFIG', PINNED)
    const shown = await $.command.run({ command: 'krci-kubelock' })

    expect(shown.text).toContain(`Built from: ${REAL}`)
    expect(w.files.get(PINNED)).toBe(KIND_ONLY)
  })

  test('falls back to ~/.kube/config when the recorded KUBECONFIG is gone', ON, async ($, on) => {
    const w = world(on, WITH_PROD)
    w.env.set('KUBECONFIG', `${HOME}/gone.yaml`)
    const shown = await $.command.run({ command: 'krci-kubelock' })

    expect(shown.text).toContain(`Built from: ${REAL}`)
    expect(shown.text).toContain('Context: kind-krci (found)')
  })

  test('/krci-kubelock reports the pin', ON, async ($, on) => {
    world(on, WITH_PROD)
    const shown = await $.command.run({ command: 'krci-kubelock' })

    expect(shown.text).toContain('krci-kubelock: on')
    expect(shown.text).toContain(`KUBECONFIG: ${PINNED}`)
  })
})

describe('lock off', () => {
  test('leaves KUBECONFIG alone and recommends turning the lock on once', async ($, on) => {
    const w = world(on, WITH_PROD)
    await $.tool.call({ tool: 'Bash', command: 'kubectl --context ctp-prod-euc1-blue-eks get po' })
    await $.tool.call({ tool: 'Bash', command: 'kubectl get po' })

    expect(w.env.get('KUBECONFIG')).toBeUndefined()
    expect(w.ran).toHaveLength(2)
    expect(w.toasts).toHaveLength(1)
    expect(w.toasts[0]).toContain('Recommended: turn it on in /config')
  })

  test('/krci-kubelock recommends turning the lock on', async ($, on) => {
    world(on, WITH_PROD)
    const shown = await $.command.run({ command: 'krci-kubelock' })

    expect(shown.text).toContain('krci-kubelock: off')
    expect(shown.text).toContain('Recommended')
  })
})
