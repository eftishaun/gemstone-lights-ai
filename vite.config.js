import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Use environment variable to determine base path
// For GitHub Pages: set GITHUB_PAGES=true
// For Vercel/Netlify: don't set it (defaults to /)
const base = process.env.GITHUB_PAGES === 'true' ? '/gemstone-lights-ai/' : '/'

export default defineConfig({
    plugins: [react()],
    base: base,
})
