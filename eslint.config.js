import js from '@eslint/js';
import jsdoc from 'eslint-plugin-jsdoc';
import react from 'eslint-plugin-react';
import reactRefreshPlugin from 'eslint-plugin-react-refresh';
import globals from 'globals';

const noCommentedCode = {
    rules: {
        'no-commented-code': {
            meta: {
                type: 'suggestion',
                docs: {
                    description: 'Disallow commented-out code',
                    category: 'Best Practices',
                    recommended: true
                }
            },
            create (context) {
                return {
                    Program () {
                        const comments = context.sourceCode.getAllComments();

                        const variableDeclarationPattern = /\b(?:const|let|var)\b\s+(\w+|\[.*\])\s*(?:[=,;]|$)/;
                        const functionPattern = /\bfunction\b\s+(\w+)\s*\(/;
                        const controlFlowPattern = /\b(?:if|else|while|for|do|switch|try|catch|finally)\b\s*(?:\(|$)/;
                        const returnPattern = /\breturn\b[^;]*;/;
                        const classPattern = /(?<!@)\bclass\b\s+(\w+)\s*(?:{|\s*$)/;
                        const arrowFunctionPattern = /(\w+)\s*=>/;
                        const objectPattern = /^(?!\s*\*)(?<!@\w+\s*\{)\{\s*(?:\w+\s*:\s*[^{}]*,?\s*)+\}(?!\s*\*)/;
                        const arrayPattern = /\[\s*.*\s*\]\s*;/;
                        const consoleLogPattern = /\bconsole\s*\.?\s*log\b\s*\(/;
                        const jsxAttributePattern = /\s*(\w+)\s*=\s*"[^"]*"\s*/;
                        const importPattern = /\s*import\s+.*from\s+['"].*['"];/;
                        const expectPattern = /\s*expect\s*\([^)\n]+\)\.[\w$]+\s*\(/;
                        const codeBracketStartPattern = /[{[(]\s*$/;
                        const codeBracketEndPattern = /^\s*[}\])]\s*;?\s*$/;
                        const semicolonPattern = /;\s*$/;

                        const referencePathPattern = /^\/<\s*\/?reference\s+path=["'].*["']\s*\/?\s*>$/;
                        const jsDocPattern = /@(param|returns|return|throws|exception|typedef|type|property|callback|async|augments|extends|implements|deprecated|example|see|link|since|version|class|constructor|default|private|protected|public|readonly|experimental|module|namespace)/;

                        comments.forEach((comment) => {
                            const commentText = comment.value.trim();

                            const exceptPatterns = {
                                jsDocPattern,
                                referencePathPattern
                            };
                            for (const pattern of Object.values(exceptPatterns)) {
                                if (pattern.test(commentText)) {
                                    return;
                                }
                            }

                            const patterns = {
                                variableDeclarationPattern,
                                functionPattern,
                                controlFlowPattern,
                                returnPattern,
                                classPattern,
                                arrowFunctionPattern,
                                objectPattern,
                                arrayPattern,
                                consoleLogPattern,
                                jsxAttributePattern,
                                importPattern,
                                expectPattern,
                                codeBracketStartPattern,
                                codeBracketEndPattern,
                                semicolonPattern
                            };

                            let matchedPattern = null;
                            for (const [ name, pattern ] of Object.entries(patterns)) {
                                if (pattern.test(commentText)) {
                                    matchedPattern = name;
                                    break;
                                }
                            }

                            if (matchedPattern) {
                                context.report({
                                    node: comment,
                                    message: `Commented-out code (matched: ${matchedPattern}).`
                                });
                            }
                        });
                    }
                };
            }
        }
    }
};

export default [
    {
        ignores: [
            '**/node_modules/',
            '**/dist/',
            '**/build/',
            '**/coverage/',
            '**/.scannerwork/'
        ]
    },
    js.configs.recommended,
    jsdoc.configs['flat/recommended'],
    {
        files: [ '**/*.{js,jsx}' ],
        languageOptions: {
            ecmaVersion: 2022,
            sourceType: 'module',
            globals: {
                ...globals.node
            }
        },
        plugins: {
            jsdoc,
            'no-commented-code': noCommentedCode
        },
        rules: {
            indent: [
                'error',
                4,
                {
                    SwitchCase: 1
                }
            ],
            'linebreak-style': [
                'error',
                'unix'
            ],
            'no-multiple-empty-lines': [
                'error',
                {
                    max: 1,
                    maxBOF: 1,
                    maxEOF: 1
                }
            ],
            'no-unused-vars': [
                'error',
                {
                    argsIgnorePattern: '^_',
                    varsIgnorePattern: '^_',
                    destructuredArrayIgnorePattern: '^_',
                    caughtErrorsIgnorePattern: '^_',
                    ignoreRestSiblings: true
                }
            ],
            'no-console': [ 'error' ],
            quotes: [
                'error',
                'single'
            ],
            semi: [
                'error',
                'always'
            ],
            'jsdoc/no-undefined-types': 'off',
            'jsdoc/require-asterisk-prefix': 'warn',
            'jsdoc/require-description-complete-sentence': 'warn',
            'jsdoc/no-blank-blocks': 'error',
            'jsdoc/require-description': 'warn',
            'jsdoc/require-jsdoc': 'off',
            'jsdoc/require-param': 'off',
            'jsdoc/require-param-description': 'off',
            'jsdoc/require-param-type': 'off',
            'jsdoc/require-returns': 'off',
            'comma-dangle': [
                'error',
                'never'
            ],
            curly: [
                'error',
                'multi-line'
            ],
            'array-bracket-newline': [
                'error',
                {
                    multiline: true,
                    minItems: null
                }
            ],
            'array-element-newline': [
                'error',
                'consistent'
            ],
            'function-paren-newline': [
                'error',
                'consistent'
            ],
            'eol-last': [
                'error',
                'always'
            ],
            'array-bracket-spacing': [
                'error',
                'always',
                {
                    objectsInArrays: true
                }
            ],
            'no-multi-spaces': [
                'error',
                {}
            ],
            'space-before-function-paren': [
                'error',
                {
                    named: 'always'
                }
            ],
            'comma-spacing': [
                'error',
                {
                    before: false,
                    after: true
                }
            ],
            'space-infix-ops': [
                'error',
                {
                    int32Hint: false
                }
            ],
            'no-trailing-spaces': [ 'error' ],
            'object-curly-spacing': [
                'error',
                'always'
            ],
            'block-spacing': [
                'error',
                'always'
            ],
            'implicit-arrow-linebreak': [
                'error',
                'beside'
            ],
            'arrow-spacing': [
                'error',
                {
                    before: true,
                    after: true
                }
            ],
            'no-commented-code/no-commented-code': 'error'
        }
    },
    {
        files: [ '**/*.jsx' ],
        ...react.configs.flat.recommended,
        settings: {
            react: {
                version: 'detect'
            }
        },
        languageOptions: {
            ...react.configs.flat.recommended.languageOptions,
            ecmaVersion: 2022,
            sourceType: 'module',
            parserOptions: {
                ecmaFeatures: {
                    jsx: true
                }
            },
            globals: {
                ...globals.browser
            }
        },
        plugins: {
            react,
            'react-refresh': reactRefreshPlugin
        },
        rules: {
            ...react.configs.flat.recommended.rules,
            'react/react-in-jsx-scope': 'off',
            'react/prop-types': 'off',
            'react/jsx-uses-react': 'error',
            'react/jsx-uses-vars': 'error',
            'react-refresh/only-export-components': 'warn',
            'no-console': 'off'
        }
    },
    {
        files: [
            'infra/scripts/**/*.js',
            'eslint.config.js'
        ],
        rules: {
            'no-console': 'off'
        }
    }
];
