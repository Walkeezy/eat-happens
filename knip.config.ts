import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignoreDependencies: ['tailwindcss'], // Ignore tailwindcss because knip doesn't recognize v4 yet
};

export default config;
