import type { LevelRendererProps } from 'c2pa-react-component-types'
import { describeProvenance, manifestsOldestFirst } from './describeProvenance'

/**
 * The built-in L2 card, with a sentence summarising every source type and action across the ingredients,
 * followed by one sentence from each assertion plugin that implements `describe` (e.g. CAWG identities).
 */
export function NounsVerbsL2({ Default, ...props }: LevelRendererProps) {
  const store = props.manifest.manifestStore
  const entries = store ? manifestsOldestFirst(store) : []
  const sentences = [
    describeProvenance(store),
    ...(props.plugin ?? []).map((plugin) => plugin.describe?.(entries)),
  ].filter((s): s is string => Boolean(s))

  return (
    <Default {...props}>
      {sentences.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
          {sentences.map((sentence, i) => (
            <p key={i} style={{ margin: 0 }}>{sentence}</p>
          ))}
        </div>
      )}
    </Default>
  )
}
