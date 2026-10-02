import type { EngineInterface, Register } from 'claude-code'

import {
  EMPTY_KUBECONFIG,
  LOCK_DIR_NAME,
  checkCommand,
  checkPath,
  isKubeCommand,
  pinnedFileName,
  touchesKubelockSetting,
  withoutLockFiles,
  type Scope,
} from './kubelock'

const ORIGIN = { plugin: 'krci-triage', key: 'kubelockOrigin' } as const
const COMMAND = 'krci-kubelock'
const DEFAULT_CONTEXT = 'kind-krci'
const MISSING_RETRY_MS = 30_000
const ENABLE_HINT = 'turn it on in /config → krci-kubelock'

type Pin = {
  scope: Scope
  dir: string
  file: string
  /** KUBECONFIG value the pin is built from. */
  sources: string
  session: string
  /** Content last written to `file`; a difference means a command changed it. */
  written: string
  isMissing: boolean
  checkedAt: number
  error?: string
}

type Lock = { context: string; ready?: Promise<Pin> }

export const register: Register = (on, options) => {
  const isOn = options.kubelock === true
  const context =
    typeof options.kubelockContext === 'string' && options.kubelockContext.trim() !== ''
      ? options.kubelockContext.trim()
      : DEFAULT_CONTEXT
  const lock: Lock = { context }
  let isNudged = false

  on('session.start', async ($, e, next) => {
    await $.command.register({
      name: COMMAND,
      description: isOn ? 'Show the krci-kubelock state and re-pin the kubeconfig' : 'Show the krci-kubelock state',
    })
    if (!isOn) {
      await restoreKubeconfig($)
      $.ui.status(undefined)
      return next(e)
    }
    const pin = await ensure($, lock)
    if (pin.isMissing) {
      $.ui.toast(`krci-kubelock: context ${context} not found; kube access is blocked until it exists`, {
        timeoutMs: 8000,
      })
    }
    return next(e)
  })

  on('command.run', { command: COMMAND }, async $ => {
    if (!isOn) {
      return {
        text: `krci-kubelock: off.\nRecommended: ${ENABLE_HINT}. It pins kubectl, helm and every script Claude runs to ${context}.`,
      }
    }
    const pin = await ensure($, lock)
    await refresh($, pin)
    return { text: describe(pin) }
  })

  on('tool.call', async ($, e, next) => {
    if (!isOn) {
      if (e.tool === 'Bash' && !isNudged && isKubeCommand(e.command)) {
        isNudged = true
        $.ui.toast(`krci-kubelock is off. Recommended: ${ENABLE_HINT}`, { timeoutMs: 8000 })
      }
      return next(e)
    }

    if (e.tool === 'Bash') {
      const pin = await ensure($, lock)
      const reason = checkCommand(e.command, pin.scope)
      if (reason !== undefined) {
        return { deny: denial(reason) }
      }
      if (pin.isMissing && (await $.clock.now()) - pin.checkedAt > MISSING_RETRY_MS) {
        await refresh($, pin)
      }
      const ran = await next(e)
      await reconcile($, pin)
      return ran
    }

    const input = e as unknown as Record<string, unknown>
    const path = [input.file_path, input.notebook_path, input.path].find(
      (value): value is string => typeof value === 'string',
    )
    if (path === undefined) {
      return next(e)
    }
    const pin = await ensure($, lock)
    const reason =
      checkPath(path, pin.scope) ??
      (touchesKubelockSetting(path, JSON.stringify(input))
        ? 'the krci-kubelock settings belong to the user; change them in /config'
        : undefined)
    return reason === undefined ? next(e) : { deny: denial(reason) }
  }).catch(async ($, e, next) =>
    next.called
      ? { deny: denial(`the post-run check failed (${next.error.message}); run /${COMMAND}`) }
      : { deny: denial(`the check failed (${next.error.message}); run /${COMMAND}`) },
  )
}

/** Pins KUBECONFIG once per module load; later calls share the first result. */
function ensure($: EngineInterface, lock: Lock): Promise<Pin> {
  lock.ready ??= createPin($, lock.context)
  return lock.ready
}

async function createPin($: EngineInterface, context: string): Promise<Pin> {
  const home = (await $.env.get('HOME')) ?? ''
  const dir = `${home}/.kube/${LOCK_DIR_NAME}`
  const file = `${dir}/${pinnedFileName(context)}`
  const pin: Pin = {
    scope: { context, home, kubeconfigs: [`${home}/.kube/config`] },
    dir,
    file,
    sources: `${home}/.kube/config`,
    session: 'session',
    written: '',
    isMissing: true,
    checkedAt: 0,
  }

  try {
    const { value } = await $.state.get(ORIGIN)
    const recorded =
      value?.isPinned === true ? value.kubeconfig : ((await $.env.get('KUBECONFIG')) ?? null)
    const kubeconfig = recorded === null ? null : withoutLockFiles(recorded, dir)
    if (value?.isPinned !== true || kubeconfig !== recorded) {
      await $.state.set(ORIGIN, { isPinned: true, kubeconfig })
    }
    pin.sources = await existingSources($, kubeconfig, pin.sources)
    pin.scope = {
      context,
      home,
      kubeconfigs: [...new Set([...pin.sources.split(':').filter(Boolean), `${home}/.kube/config`])],
    }
    pin.session = await $.session.id()
    await refresh($, pin)
  } catch (error) {
    pin.isMissing = true
    pin.error = error instanceof Error ? error.message : String(error)
    showStatus($, pin)
  } finally {
    await $.env.set('KUBECONFIG', file)
  }
  return pin
}

/** The entries of a KUBECONFIG value that exist on disk; the fallback when none do. */
async function existingSources($: EngineInterface, kubeconfig: string | null, fallback: string): Promise<string> {
  const kept: string[] = []
  for (const entry of kubeconfig?.split(':') ?? []) {
    if (entry !== '' && (await $.fs.exists(entry))) {
      kept.push(entry)
    }
  }
  return kept.length === 0 ? fallback : kept.join(':')
}

/** Rebuilds the pinned file from the user's own kubeconfig. */
async function refresh($: EngineInterface, pin: Pin): Promise<void> {
  const content = await minify($, pin.sources, pin.scope.context)
  await write($, pin, content ?? EMPTY_KUBECONFIG)
  pin.isMissing = content === undefined
  pin.error = undefined
  pin.checkedAt = await $.clock.now()
  showStatus($, pin)
}

/** Strips anything a command added to the pinned file beyond the allowed context. */
async function reconcile($: EngineInterface, pin: Pin): Promise<void> {
  try {
    const current = (await $.fs.exists(pin.file)) ? await $.fs.read(pin.file) : undefined
    if (current === pin.written) {
      return
    }
    const content = current === undefined ? undefined : await minify($, pin.file, pin.scope.context)
    if (content === undefined) {
      await refresh($, pin)
      return
    }
    await write($, pin, content)
    pin.isMissing = false
    pin.error = undefined
    showStatus($, pin)
  } catch (error) {
    pin.isMissing = true
    pin.error = error instanceof Error ? error.message : String(error)
    showStatus($, pin)
  }
}

async function minify($: EngineInterface, kubeconfig: string, context: string): Promise<string | undefined> {
  try {
    const run = await $.process.run(
      ['kubectl', 'config', 'view', '--minify', '--flatten', '--context', context],
      { env: { KUBECONFIG: kubeconfig }, timeoutMs: 10_000 },
    )
    return run.exitCode === 0 && run.stdout.trim() !== '' ? run.stdout : undefined
  } catch {
    return undefined
  }
}

/** Replaces the pinned file in one rename, owner-only. */
async function write($: EngineInterface, pin: Pin, content: string): Promise<void> {
  const temp = `${pin.file}.${pin.session}.tmp`
  const run = await $.process.run(
    ['sh', '-c', 'umask 077 && mkdir -p "$1" && cat > "$2" && mv -f "$2" "$3"', 'sh', pin.dir, temp, pin.file],
    { stdin: content, timeoutMs: 10_000 },
  )
  if (run.exitCode !== 0) {
    throw new Error(`cannot write ${pin.file}: ${run.stderr.trim()}`)
  }
  pin.written = content
}

async function restoreKubeconfig($: EngineInterface): Promise<void> {
  const { value } = await $.state.get(ORIGIN)
  if (value?.isPinned !== true) {
    return
  }
  await $.env.set('KUBECONFIG', value.kubeconfig ?? undefined)
  await $.state.set(ORIGIN, { isPinned: false, kubeconfig: value.kubeconfig })
}

function showStatus($: EngineInterface, pin: Pin): void {
  const context = pin.scope.context
  $.ui.status(
    pin.error !== undefined
      ? `⎈ ${context} · krci-kubelock error · kube access blocked`
      : pin.isMissing
        ? `⎈ ${context} missing · kube access blocked`
        : `⎈ ${context} 🔒`,
  )
}

function describe(pin: Pin): string {
  const state =
    pin.error !== undefined
      ? `error (${pin.error}), kube access blocked`
      : pin.isMissing
        ? 'not found, kube access blocked until it exists'
        : 'found'
  return [
    'krci-kubelock: on',
    `Context: ${pin.scope.context} (${state})`,
    `KUBECONFIG: ${pin.file}`,
    `Built from: ${pin.sources}`,
  ].join('\n')
}

function denial(reason: string): string {
  return `krci-kubelock: ${reason}.`
}
