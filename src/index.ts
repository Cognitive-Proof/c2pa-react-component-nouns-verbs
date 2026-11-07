import type { LevelOverrides } from 'c2pa-react-component-types'
import { NounsVerbsL2 } from './NounsVerbsL2'

export { NounsVerbsL2 }
export { describeProvenance, collectNounsAndVerbs, manifestsOldestFirst } from './describeProvenance'
export { describeNounsAndVerbs, nounsAndVerbsSentences } from './describeNounsAndVerbs'

/** Pass to `<C2paManifest levels={nounsVerbsLevels} />`. */
export const nounsVerbsLevels: LevelOverrides = { 2: NounsVerbsL2 }
