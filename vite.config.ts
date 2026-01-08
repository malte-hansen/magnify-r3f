import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import glsl from 'vite-plugin-glsl';
import { fileURLToPath } from 'url';
import { dirname, resolve } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  if (mode === 'library') {
    // Build as library
    return {
      plugins: [react(), glsl()],
      build: {
        lib: {
          entry: resolve(__dirname, 'src/index.tsx'),
          name: 'MagnifyR3F',
          formats: ['es', 'cjs'],
          fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
        },
        rollupOptions: {
          external: ['react', 'react-dom', 'three', '@react-three/fiber'],
          output: {
            globals: {
              react: 'React',
              'react-dom': 'ReactDOM',
              three: 'THREE',
              '@react-three/fiber': 'ReactThreeFiber',
            },
          },
        },
      },
    };
  } else {
    // Development mode - run sample
    return {
      plugins: [react(), glsl()],
      root: 'sample',
      resolve: {
        alias: {
          'magnify-r3f': resolve(__dirname, 'src/index.tsx'),
        },
      },
    };
  }
});
