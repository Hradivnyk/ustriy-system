import js from '@eslint/js';
import tseslint from 'typescript-eslint';
import prettierConfig from 'eslint-config-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooksPlugin from 'eslint-plugin-react-hooks';
import nextPlugin from '@next/eslint-plugin-next';
import importPlugin from 'eslint-plugin-import';
import securityPlugin from 'eslint-plugin-security';
import globals from 'globals';

export default tseslint.config(
  // ── Global ignores ────────────────────────────────────────────────────────
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/.next/**',
      '**/build/**',
      '**/.turbo/**',
      '**/*.config.{js,mjs,cjs}',
    ],
  },

  // ── Base JS recommended (all files) ──────────────────────────────────────
  js.configs.recommended,

  // ── Shared TypeScript rules (all apps) ───────────────────────────────────
  {
    files: ['apps/**/*.{ts,tsx}'],
    extends: tseslint.configs.recommended,
    plugins: {
      import: importPlugin,
    },
    languageOptions: {
      parserOptions: {
        // Automatically finds the nearest tsconfig.json per file.
        // test/ files are covered by apps/backend/test/tsconfig.json → tsconfig.e2e.json
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      // Disable base rules overridden by TypeScript-aware equivalents
      'no-unused-vars': 'off',
      'require-await': 'off',
      'no-throw-literal': 'off',

      // TypeScript
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/require-await': 'error',
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/consistent-type-imports': ['error', { prefer: 'type-imports' }],

      // General
      'no-console': 'warn',
      'no-var': 'error',
      'prefer-const': 'error',
      eqeqeq: ['error', 'always'],
      'no-async-promise-executor': 'error',
      'no-await-in-loop': 'warn',

      // Import
      'import/no-duplicates': 'error',
      'import/no-cycle': 'warn',
      'import/order': [
        'warn',
        {
          groups: ['builtin', 'external', 'internal', ['parent', 'sibling', 'index']],
          'newlines-between': 'always',
          alphabetize: { order: 'asc', caseInsensitive: true },
        },
      ],
    },
  },

  // ── Frontend: Next.js + React (apps/frontend) ────────────────────────────
  {
    files: ['apps/frontend/**/*.{ts,tsx,js,jsx}'],
    plugins: {
      react: reactPlugin,
      'react-hooks': reactHooksPlugin,
      '@next/next': nextPlugin,
    },
    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.es2021,
      },
    },
    settings: {
      react: { version: 'detect' },
      next: { rootDir: 'apps/frontend' },
    },
    rules: {
      // React core
      ...reactPlugin.configs.recommended.rules,

      // React hooks
      'react-hooks/rules-of-hooks': 'error',
      'react-hooks/exhaustive-deps': 'warn',

      // Next.js
      ...nextPlugin.configs.recommended.rules,
      ...nextPlugin.configs['core-web-vitals'].rules,

      // App Router: React is auto-imported, prop-types are covered by TS
      'react/react-in-jsx-scope': 'off',
      'react/prop-types': 'off',

      // Return types are verbose and redundant with TS inference in React components
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // ── Backend: NestJS (apps/backend) ───────────────────────────────────────
  {
    files: ['apps/backend/**/*.ts'],
    extends: [securityPlugin.configs.recommended],
    languageOptions: {
      globals: {
        ...globals.node,
      },
    },
    rules: {
      // NestJS uses decorators heavily — explicit signatures help with DI clarity
      '@typescript-eslint/explicit-function-return-type': 'warn',
      '@typescript-eslint/explicit-member-accessibility': [
        'warn',
        { accessibility: 'no-public' },
      ],
      // Backend should never leak logs to stdout in production
      'no-console': 'error',

      // Security — tune severity per risk level
      'security/detect-eval-with-expression': 'error',
      'security/detect-non-literal-fs-filename': 'error',
      'security/detect-non-literal-regexp': 'warn',
      'security/detect-object-injection': 'warn',
      'security/detect-possible-timing-attacks': 'error',
      'security/detect-unsafe-regex': 'error',
    },
  },

  // ── Tests ─────────────────────────────────────────────────────────────────
  {
    files: ['**/*.{spec,test}.{ts,tsx,js,jsx}', '**/*.e2e-spec.{ts,js}', '**/test/**/*.{ts,js}', '**/tests/**/*.{ts,js}'],
    languageOptions: {
      globals: {
        ...globals.jest,
      },
    },
    rules: {
      'no-console': 'off',
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
    },
  },

  // ── Prettier: must be last — disables all formatting-related ESLint rules ─
  prettierConfig,
);
