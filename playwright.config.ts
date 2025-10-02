import { defineConfig } from '@playwright/test'

export default defineConfig({
  testDir: 'tests',
  timeout: 30_000,
  use: {
    headless: true,
    baseURL: process.env.BASE_URL || 'http://localhost:3001',
  },
  // Start the Next.js dev server if it's not already running. Playwright will wait for the URL.
  webServer: {
    // Pass the port arg to avoid interactive prompt if 3000 is in use
    command: 'npm run dev -- --port 3001',
    url: process.env.BASE_URL || 'http://localhost:3001',
    env: {
      // Ensure NextAuth uses the same origin as Playwright's baseURL
      NEXTAUTH_URL: process.env.BASE_URL || 'http://localhost:3001',
      NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET || 'devsecret_playwright_1234'
    },
    timeout: 120_000,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { browserName: 'chromium' } }
  ]
})
