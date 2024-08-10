import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        keywords: ['int', 'if', 'fi', 'loop', 'pool', 'print'],
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
            lineComment: '//', // scalc line comment token
        },
        brackets: [['[', ']']],
        autoClosingPairs: [
            {open: '[', close: ']'}, // scalc brackets
        ],
    };
}

monaco.languages.register({id: 'scalc'});
monaco.languages.setMonarchTokensProvider('scalc', definition());
monaco.languages.setLanguageConfiguration('scalc', configuration());

export {};
