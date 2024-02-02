import { defineBuildConfig } from 'unbuild'

export default defineBuildConfig({
  declaration: true,
  name: '@barbapapazes/plausible-tracker',
  entries: [
    'src/index',
    { input: 'src/extensions/', outDir: 'dist/extensions', format: 'esm', ext: 'mjs' },
    { input: 'src/extensions/', outDir: 'dist/extensions', format: 'cjs', ext: 'cjs' },
  ],
  rollup: {
    emitCJS: true,
  },
})
