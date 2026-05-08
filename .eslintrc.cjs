module.exports = {
    root: true,
    env: {
        node: true,
        browser: true
    },
    parserOptions: {
        parser: '@typescript-eslint/parser',
        sourceType: 'module',
        ecmaVersion: 2023
    },
    plugins: ['vue', '@typescript-eslint', 'prettier'],
    extends: [
        '@nuxtjs/eslint-config-typescript',
        'plugin:prettier/recommended'
    ],
    rules: {
        'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
        'vue/multi-word-component-names': 'off',
        'prettier/prettier': [
            'error',
            {
                endOfLine: 'auto'
            }
        ],
        'dot-notation': 'off'
    }
}
