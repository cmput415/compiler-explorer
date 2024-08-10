import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        keywords: ['integer', 'real', 'character', 'boolean', 'proceedure', 'function'],
        operators: ['+', '-', '/', '*'],
        tokenizer: {
            root: [
                {include: '@whitespace'},
                [/\[/, 'lbracket'],
                [/[a-zA-Z][a-zA-Z]*/, 'variable'],
                [/\d+/, 'number'],
                [/\]/, 'rbracket'],
            ],
            whitespace: [
                [/[ \t\r\n]+/, ''],
                [/#.*$/, 'comment'],
            ],
        },
    };
}

function configuration(): monaco.languages.LanguageConfiguration {
    return {
        comments: {
            lineComment: '//', // vcalc line comment token
        },
        brackets: [['[', ']']],
        autoClosingPairs: [
            {open: '[', close: ']'}, // vcalc brackets
        ],
    };
}

monaco.languages.register({id: 'gazc'});
monaco.languages.setMonarchTokensProvider('gazc', definition());
monaco.languages.setLanguageConfiguration('gazc', configuration());

export {};
