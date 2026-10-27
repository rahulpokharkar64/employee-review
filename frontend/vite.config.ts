import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// The backend only allows http://localhost:5173 (CORS_ORIGINS), so the port is fixed.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
})
