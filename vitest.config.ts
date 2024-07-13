import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    environmentMatchGlobs: [
      // all tests ending with `.dom.spec.ts` will run in jsdom
      ['test/**/*.dom.spec.ts', 'jsdom'],
    ],
  },
})
