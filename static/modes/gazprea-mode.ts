

import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        defaultToken: 'invalid',

        keywords: [
            'integer', 'real', 'character', 'boolean',
            'procedure', 'function', 'returns',
            'true', 'false', 'var', 'const', 'tuple'
        ],
        operators: [
            '+', '-', '/', '*',
            '<', '>', '==', '!=',
            '=', '->', '..'
        ],

        tokenizer: {
            root: [
                {include: '@whitespace'},

                // Strings
                [/"/, { token: 'string.quote', bracket: '@open', next: '@string' }],

                // Character literals
                [/'[^']*'/, 'string.char'],

                // Identifiers and keywords
                [/[a-zA-Z_]\w*/, {
                    cases: {
                        '@keywords': 'keyword',
                        'true': 'boolean',
                        'false': 'boolean',
                        '@default': 'identifier'
                    }
                }],

                // Numbers
                [/\d+/, 'number'],

                // Operators
                [/[+\-*/=<>!]+/, 'operator'],
                [/->/, 'operator'],
                [/\.\./, 'operator'],

                // Brackets and delimiters
                [/[\[\](){}]/, 'delimiter.bracket'],
                [/[;,]/, 'delimiter'],  // Added comma

                // Dot
                [/\./, 'delimiter'],  // Added dot

                [/[[\]]/, 'delimiter.bracket'],
                [/\*/, 'operator']
            ],

            string: [
                [/[^\\"]+/, 'string'],
                [/"/, { token: 'string.quote', bracket: '@close', next: '@pop' }],
                [/\\./, 'string.escape']
            ],

            whitespace: [
                [/[ \t\r\n]+/, 'white'],
                [/\/\/.*$/, 'comment'],
            ],
        },
    };
}

function configuration(): monaco.languages.LanguageConfiguration {
    return {
        comments: {
            lineComment: '//',
        },
        brackets: [
            ['[', ']'],
            ['(', ')'],
            ['{', '}']
        ],
        autoClosingPairs: [
            {open: '[', close: ']'},
            {open: '(', close: ')'},
            {open: '{', close: '}'},
            {open: '"', close: '"', notIn: ['string']},
            {open: "'", close: "'", notIn: ['string', 'comment']} 
        ],
        surroundingPairs: [
            {open: '[', close: ']'},
            {open: '(', close: ')'},
            {open: '{', close: '}'},
            {open: '"', close: '"'},
            {open: "'", close: "'"} 
        ]
    };
}

monaco.languages.register({id: 'gazc'});
monaco.languages.setMonarchTokensProvider('gazc', definition());
monaco.languages.setLanguageConfiguration('gazc', configuration());

export {};