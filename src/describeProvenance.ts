import type { C2paAction, ManifestEntry, ManifestStore } from 'c2pa-react-component-types'

// IPTC digital source types (http://cv.iptc.org/newscodes/digitalsourcetype/<key>)
const SOURCE_TYPE_NOUNS: Record<string, string> = {
  digitalCapture: 'Digital Capture',
  computationalCapture: 'Computational Capture',
  negativeFilm: 'Negative Film',
  positiveFilm: 'Positive Film',
  print: 'Print',
  humanEdits: 'Human Edits',
  compositeCapture: 'Composite Capture',
  algorithmicallyEnhanced: 'Algorithmically Enhanced',
  digitalCreation: 'Digital Creation',
  digitalArt: 'Digital Creation',
  dataDrivenMedia: 'Data-Driven Media',
  trainedAlgorithmicMedia: 'AI-Generated',
  compositeWithTrainedAlgorithmicMedia: 'AI-Edited',
  trainedAlgorithmicData: 'AI-Generated Data',
  algorithmicMedia: 'Algorithmic Media',
  screenCapture: 'Screen Capture',
  virtualRecording: 'Virtual Recording',
  composite: 'Composite',
  compositeSynthetic: 'Synthetic Composite',
}

const ACTION_VERBS: Record<string, string> = {
  'c2pa.color_adjustments': 'Color Adjusted',
  'c2pa.converted': 'Converted',
  'c2pa.cropped': 'Cropped',
  'c2pa.deleted': 'Deleted',
  'c2pa.drawing': 'Drawn On',
  'c2pa.dubbed': 'Dubbed',
  'c2pa.edited': 'Edited',
  'c2pa.edited.metadata': 'Edited Metadata',
  'c2pa.enhanced': 'Enhanced',
  'c2pa.filtered': 'Filtered',
  'c2pa.mixed': 'Mixed',
  'c2pa.orientation': 'Reoriented',
  'c2pa.placed': 'Placed',
  'c2pa.produced': 'Produced',
  'c2pa.published': 'Published',
  'c2pa.redacted': 'Redacted',
  'c2pa.remixed': 'Remixed',
  'c2pa.removed': 'Removed',
  'c2pa.repackaged': 'Repackaged',
  'c2pa.resized': 'Resized',
  'c2pa.transcoded': 'Transcoded',
  'c2pa.translated': 'Translated',
  'c2pa.trimmed': 'Trimmed',
  'c2pa.watermarked': 'Watermarked',
  'c2pa.watermarked.bound': 'Watermarked',
  'c2pa.watermarked.unbound': 'Watermarked',
}

// Actions that describe how the asset came to exist rather than what was done to it —
// the digital source type already covers that.
const IGNORED_ACTIONS = new Set(['c2pa.created', 'c2pa.opened', 'c2pa.unknown'])

function titleCase(words: string): string {
  return words.replace(/\b\w/g, (c) => c.toUpperCase())
}

export function sourceTypeNoun(uri: string): string {
  const key = uri.split('/').pop() ?? uri
  return SOURCE_TYPE_NOUNS[key] ?? titleCase(key.replace(/([a-z])([A-Z])/g, '$1 $2'))
}

export function actionVerb(action: string): string {
  if (ACTION_VERBS[action]) return ACTION_VERBS[action]
  // Custom actions (e.g. "com.example.remixed") — use the last segment.
  const last = action.split('.').pop() ?? action
  return titleCase(last.replace(/_/g, ' '))
}

function getActions(entry: ManifestEntry): C2paAction[] {
  const v2 = entry.assertions?.['c2pa.actions.v2'] as { actions?: C2paAction[] } | undefined
  const v1 = entry.assertions?.['c2pa.actions'] as { actions?: C2paAction[] } | undefined
  return [...(v2?.actions ?? []), ...(v1?.actions ?? [])]
}

/**
 * Every manifest reachable from the active one, deepest ingredients first and the active manifest last.
 * Siblings keep their ingredient order.
 */
export function manifestsOldestFirst(store: ManifestStore): ManifestEntry[] {
  const levels: string[][] = []
  const visited = new Set<string>()
  let current = [store.activeManifest]
  while (current.length > 0) {
    const level: string[] = []
    const next: string[] = []
    for (const id of current) {
      if (visited.has(id) || !store.manifests[id]) continue
      visited.add(id)
      level.push(id)
      for (const ing of store.manifests[id].ingredients ?? []) {
        if (ing.active_manifest) next.push(ing.active_manifest)
      }
    }
    if (level.length > 0) levels.push(level)
    current = next
  }
  return levels.reverse().flat().map((id) => store.manifests[id])
}

export function collectNounsAndVerbs(store: ManifestStore): { nouns: string[]; verbs: string[] } {
  const nouns = new Set<string>()
  const verbs = new Set<string>()
  for (const entry of manifestsOldestFirst(store)) {
    for (const act of getActions(entry)) {
      if (act.digitalSourceType) nouns.add(sourceTypeNoun(act.digitalSourceType))
      if (!IGNORED_ACTIONS.has(act.action)) verbs.add(actionVerb(act.action))
    }
  }
  return { nouns: [...nouns], verbs: [...verbs] }
}

function joinList(items: string[]): string {
  if (items.length <= 1) return items.join('')
  return `${items.slice(0, -1).join(', ')} and ${items[items.length - 1]}`
}

/**
 * e.g. "This is a combination of Digital Capture, AI-Generated and Human Edits content that has been Mixed, Dubbed and Enhanced."
 * Returns undefined when the manifests carry no source types or actions.
 */
export function describeProvenance(store: ManifestStore | undefined): string | undefined {
  if (!store) return undefined
  const { nouns, verbs } = collectNounsAndVerbs(store)
  if (nouns.length === 0 && verbs.length === 0) return undefined

  const done = verbs.length > 0 ? ` has been ${joinList(verbs)}` : ''
  if (nouns.length === 0) return `This content${done}.`

  const subject = nouns.length > 1
    ? `This is a combination of ${joinList(nouns)} content`
    : `This is ${nouns[0]} content`
  return done ? `${subject} that${done}.` : `${subject}.`
}
