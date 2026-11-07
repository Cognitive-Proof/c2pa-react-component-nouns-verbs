import { describe, expect, it } from 'vitest'
import type { ManifestStore } from 'c2pa-react-component-types'
import { describeProvenance } from './describeProvenance'

const DST = 'http://cv.iptc.org/newscodes/digitalsourcetype/'

function actions(...acts: { action: string; digitalSourceType?: string }[]) {
  return { 'c2pa.actions.v2': { actions: acts } }
}

describe('describeProvenance', () => {
  it('uses "combination of" across ingredients, oldest first, and skips created/opened', () => {
    const store: ManifestStore = {
      activeManifest: 'active',
      manifests: {
        active: {
          assertions: actions(
            { action: 'c2pa.opened' },
            { action: 'c2pa.edited', digitalSourceType: `${DST}humanEdits` },
            { action: 'c2pa.mixed' },
          ),
          ingredients: [{ active_manifest: 'photo' }, { active_manifest: 'ai' }],
        },
        photo: { assertions: actions({ action: 'c2pa.created', digitalSourceType: `${DST}digitalCapture` }) },
        ai: {
          assertions: actions(
            { action: 'c2pa.created', digitalSourceType: `${DST}trainedAlgorithmicMedia` },
            { action: 'com.example.remixed' },
          ),
        },
      },
    }
    expect(describeProvenance(store)).toBe(
      'This is a combination of Digital Capture, AI-Generated and Human Edits content that has been Remixed, Edited and Mixed.',
    )
  })

  it('omits "combination of" for a single source type', () => {
    const store: ManifestStore = {
      activeManifest: 'a',
      manifests: { a: { assertions: actions({ action: 'c2pa.created', digitalSourceType: `${DST}trainedAlgorithmicMedia` }) } },
    }
    expect(describeProvenance(store)).toBe('This is AI-Generated content.')
  })

  it('falls back to "This content" when there are actions but no source type', () => {
    const store: ManifestStore = { activeManifest: 'a', manifests: { a: { assertions: actions({ action: 'c2pa.edited' }) } } }
    expect(describeProvenance(store)).toBe('This content has been Edited.')
  })

  it('returns undefined with no source types or actions', () => {
    expect(describeProvenance({ activeManifest: 'a', manifests: { a: {} } })).toBeUndefined()
  })
})
