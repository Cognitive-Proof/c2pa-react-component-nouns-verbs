import type { PluginC2PA, VerificationOutcome } from 'c2pa-react-component-types'
import { describeProvenance, manifestsOldestFirst } from './describeProvenance'

/**
 * The Nouns and Verbs summary as plain text, without rendering anything: the sentence from
 * `describeProvenance`, then one sentence from each plugin that implements `describe`, joined by spaces.
 * Takes the same `manifest` as `<C2paManifest>`. Returns '' when there is nothing to say.
 */
export function describeNounsAndVerbs(manifest: VerificationOutcome | undefined, plugins: PluginC2PA[] = []): string {
  return nounsAndVerbsSentences(manifest, plugins).join(' ')
}

export function nounsAndVerbsSentences(manifest: VerificationOutcome | undefined, plugins: PluginC2PA[] = []): string[] {
  const store = manifest?.manifestStore
  const entries = store ? manifestsOldestFirst(store) : []
  return [describeProvenance(store), ...plugins.map((plugin) => plugin.describe?.(entries))].filter(
    (s): s is string => Boolean(s),
  )
}
