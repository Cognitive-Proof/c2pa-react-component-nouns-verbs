# c2pa-react-component-nouns-verbs

Level-override plugin for `c2pa-react-component`. It replaces the L2 disclosure view.

```tsx
import { C2paManifest } from 'c2pa-react-component'
import { nounsVerbsLevels } from 'c2pa-react-component-nouns-verbs'

<C2paManifest manifest={manifest} level={2} levels={nounsVerbsLevels} />
```

## Text only

To get the summary as a string instead of a React element, pass the same `manifest` you would give
`C2paManifest`:

```ts
import { describeNounsAndVerbs } from 'c2pa-react-component-nouns-verbs'

describeNounsAndVerbs(manifest)
// "This is a combination of Digital Capture and AI-Edited content that has been Edited."
```

It returns `''` when the manifests declare no source types or actions. Pass plugins as a second
argument to append their `describe` sentences, as the L2 view does.
