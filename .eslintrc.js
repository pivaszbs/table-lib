module.exports = {
    extends: [
        'airbnb-base',
        'airbnb-base/rules/strict',
        'plugin:react/recommended',
        'plugin:prettier/recommended',
        'plugin:@typescript-eslint/recommended',
    ],
    settings: {
        react: {
            version: 'detect',
        },
    },
    plugins: ['prettier', 'react', 'react-hooks', 'lodash', '@typescript-eslint'],
    env: {
        es6: true,
        browser: true,
    },

    globals: {
        jest: true,
    },

    parserOptions: {
        sourceType: 'module',
        ecmaFeatures: {
            jsx: true,
            ecmaVersion: 2018,
        },
        impliedStrict: true,
    },

    rules: {
        'no-continue': 'off',
        'no-use-before-define': 'off',
        '@typescript-eslint/no-use-before-define': ['error', { functions: false, classes: false }],
        'no-shadow': 'off',
        '@typescript-eslint/no-shadow': 'error',
        'react-hooks/rules-of-hooks': 'warn',
        'react-hooks/exhaustive-deps': 'warn',
    },

    overrides: [
        {
            files: ['*.js'],
            rules: {
                '@typescript-eslint/no-var-requires': 'off',
            },
        },
        {
            files: ['*.ts', '*.tsx'],
            parser: '@typescript-eslint/parser',
            rules: {
                '@typescript-eslint/no-explicit-any': 'off',
                '@typescript-eslint/explicit-function-return-type': 'off',
                '@typescript-eslint/indent': 'off',
                'import/extensions': 'off',
                'import/no-unresolved': 'off',
                'import/no-cycle': [2, { ignoreExternal: true }],
                'react/prop-types': 'off',
                '@typescript-eslint/ban-ts-comment': 'off',
                'flowtype/no-types-missing-file-annotation': 'off',
                'no-unused-expressions': 'off',
                'import/prefer-default-export': 'off',
                'no-param-reassign': 'warn',
                'prefer-promise-reject-errors': 'warn',
                'no-plusplus': 'warn',
                'import/no-extraneous-dependencies': 'warn',
                'class-methods-use-this': 'off',
                'no-restricted-syntax': 'warn',
                'no-return-assign': 'warn',
                'max-classes-per-file': 'off',
                'no-fallthrough': 'off',
            },
        },
        {
            files: ['*.tsx'],
            rules: {
                'max-lines': [
                    'error',
                    {
                        max: 120,
                        skipBlankLines: true,
                        skipComments: true,
                    },
                ],
            },
        },
    ],
};
