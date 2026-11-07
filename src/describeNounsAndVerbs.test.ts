import { describe, expect, it } from 'vitest'
import type { PluginC2PA, VerificationOutcome } from 'c2pa-react-component-types'
import { describeNounsAndVerbs } from './describeNounsAndVerbs'

const DST = 'http://cv.iptc.org/newscodes/digitalsourcetype/'

function outcome(manifests: VerificationOutcome['manifestStore']): VerificationOutcome {
  return { state: true, manifests: [], manifestStore: manifests }
}

const photoEditedWithAi = outcome({
  activeManifest: 'active',
  manifests: {
    active: {
      assertions: { 'c2pa.actions.v2': { actions: [{ action: 'c2pa.opened' }, { action: 'c2pa.edited', digitalSourceType: `${DST}compositeWithTrainedAlgorithmicMedia` }] } },
      ingredients: [{ active_manifest: 'photo' }],
    },
    photo: { assertions: { 'c2pa.actions.v2': { actions: [{ action: 'c2pa.created', digitalSourceType: `${DST}digitalCapture` }] } } },
  },
})

describe('describeNounsAndVerbs', () => {
  it('returns the provenance sentence as a string', () => {
    expect(describeNounsAndVerbs(photoEditedWithAi)).toBe(
      'This is a combination of Digital Capture and AI-Edited content that has been Edited.',
    )
  })

  it('appends each plugin sentence, skipping plugins without one', () => {
    const withDescribe = Object.assign(() => null, { describe: (entries: unknown[]) => `${entries.length} manifests.` }) as PluginC2PA
    const without = (() => null) as PluginC2PA
    expect(describeNounsAndVerbs(photoEditedWithAi, [withDescribe, without])).toBe(
      'This is a combination of Digital Capture and AI-Edited content that has been Edited. 2 manifests.',
    )
  })

  it('returns an empty string with no manifest store', () => {
    expect(describeNounsAndVerbs(undefined)).toBe('')
    expect(describeNounsAndVerbs({ state: false, manifests: [], manifestStore: undefined })).toBe('')
  })
})
