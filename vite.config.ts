import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import type { Plugin } from 'vite'

// Stamps the deployed page with the commit it was built from, so the
// post-deploy functional tests can wait until GitHub Pages serves this build.
function buildShaMeta(): Plugin {
  const sha = process.env.GITHUB_SHA ?? 'dev'
  return {
    name: 'build-sha-meta',
    transformIndexHtml: () => [{ tag: 'meta', attrs: { name: 'build-sha', content: sha }, injectTo: 'head' }],
  }
}

// https://vite.dev/config/
export default defineConfig({
  base: '/kindergarten-arcade/',
  plugins: [react(), buildShaMeta()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
    restoreMocks: true,
  },
})
