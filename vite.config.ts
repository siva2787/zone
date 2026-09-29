import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching entirely when DISABLE_HMR is true (saves CPU during agent edits).
      // Otherwise, watch as normal but ALWAYS ignore the runtime data file.
      //
      // Why: the server writes to data/learntwin_db.json on nearly every API call
      // (db.save() runs on login, onboarding, assessment submission, tutor chat, etc.,
      // and even on plain GETs like /api/learning-twin via updateTwinMastery()).
      // Without ignoring it, Vite's watcher sees that write as a source file change and
      // triggers a full page reload. The reload re-mounts React, which re-fires the
      // mount-time fetches, which write to the file again -> infinite reload loop.
      watch:
        process.env.DISABLE_HMR === 'true'
          ? null
          : {
            ignored: ['**/data/**', '**/dist/**', '**/node_modules/**'],
          },
    },
  };
});