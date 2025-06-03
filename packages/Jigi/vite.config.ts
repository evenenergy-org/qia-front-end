import { dirname, resolve } from 'path'
import { fileURLToPath } from 'url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import dts from 'vite-plugin-dts'

const __dirname = dirname(fileURLToPath(import.meta.url))

// https://vite.dev/config/
export default defineConfig({
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.tsx'),
      name: 'jigi',
      fileName: (format) => `jigi.${format}.js`,
      formats: ['es', 'umd']
    },
    rollupOptions: {
      external: ['react', 'react-dom'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
        },
        assetFileNames: (assetInfo) => {
          if (assetInfo.name === 'style.css') return 'jigi.css';
          return assetInfo.name;
        },
      },
    }
  },
  plugins: [
    react(),
    dts({
      include: ['src/**/*.ts', 'src/**/*.tsx'],
      outDir: 'dist/types',
      rollupTypes: true
    })
  ],
  server: {
    host: '0.0.0.0',
    port: 3000,
  },
  // 开发时使用 App.tsx 作为入口
  root: '.',
  // 配置别名，使开发环境使用源码
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'jigi': resolve(__dirname, 'src/index.tsx')
    }
  },
  css: {
    postcss: './postcss.config.cjs',
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development')
  }
})
