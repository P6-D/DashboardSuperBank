import pluginVue from 'eslint-plugin-vue'
import vueTsConfigs from '@vue/eslint-config-typescript'

export default [
  {
    name: 'app/files-to-lint',
    files: ['**/*.{ts,mts,tsx,vue}'],
  },
  {
    name: 'app/files-to-ignore',
    ignores: ['**/dist/**', '**/dist-ssr/**', '**/coverage/**', '**/node_modules/**'],
  },
  ...pluginVue.configs['flat/recommended'],
  ...vueTsConfigs(),
  {
    rules: {
      'vue/multi-word-component-names': 'off',
      'vue/no-v-html': 'error',
      'vue/max-attributes-per-line': 'off',
      'vue/singleline-html-element-content-newline': 'off',
      'vue/html-self-closing': 'off',
      // Optional TS props are intentionally left undefined rather than defaulted (idiomatic in <script setup lang="ts">).
      'vue/require-default-prop': 'off',
      // Prettier owns template formatting; these two rules fight Prettier's output.
      'vue/html-closing-bracket-newline': 'off',
      'vue/html-indent': 'off',
    },
  },
]
