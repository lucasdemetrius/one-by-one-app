// Arquivo: vite.config.ts
// Descrição: Configuração do Vite (servidor de desenvolvimento e build).
//            - Plugin do React para suporte a JSX/TSX e Fast Refresh.
//            - Plugin do Tailwind CSS v4.
//            - Alias "@" apontando para a pasta src/ (imports mais limpos).
//            - Proxy: toda chamada para /api é redirecionada ao backend Go
//              (http://localhost:8090), evitando problemas de CORS em dev.

import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'node:path'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    // Permite importar "@/componentes/..." em vez de "../../componentes/..."
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    port: 5273,
    // Necessário para o Vite ser acessível de fora do container Docker
    host: true,
    proxy: {
      // Tudo que começar com /api vai para o backend Go.
      // No navegador você chama "/api/v1/...", o Vite repassa para a API.
      '/api': {
        target: 'http://localhost:8090',
        changeOrigin: true,
        // Habilita o proxy de WebSocket (1:1 ao vivo em /api/v1/ws/...).
        ws: true,
      },
    },
  },
})
