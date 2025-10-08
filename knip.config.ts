import type { KnipConfig } from 'knip';

const config: KnipConfig = {
  ignore: ['src/components/shadcn/**'],
  ignoreDependencies: ['tailwindcss'], // Ignore tailwindcss because knip doesn't recognize v4 yet
};

export default config;
