import { config as smartiveConfig } from '@smartive/eslint-config';

/** @type {import('eslint').Linter.Config[]} */
const config = [
  ...smartiveConfig('nextjs'),
  {
    rules: {
      'react/forbid-component-props': ['off'],
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['../*'],
              message: 'Relative imports are not allowed',
            },
          ],
        },
      ],
    },
  },
];

export default config;
