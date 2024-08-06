import * as monaco from 'monaco-editor';

function definition(): monaco.languages.IMonarchLanguage {
    return {
        keywords: ['in'],
        operators: ['|', '..', '+', '-', '/', '*'],
        tokenizer: {
            root: [
                {include: '@whitespace'},
                [/\[/, 'lparen'],
                [/[a-zA-Z][a-zA-Z]*/, 'variable'],
                [/\d+/, 'number'],
                [/\]/, 'rparen'],
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
            lineComment: '//', // generator line comment token
        },
        brackets: [['[', ']']],
        autoClosingPairs: [
            {open: '[', close: ']'}, // generator brackets
        ],
    };
}

monaco.languages.register({id: 'generator'});
monaco.languages.setMonarchTokensProvider('generator', definition());
monaco.languages.setLanguageConfiguration('generator', configuration());

export {};
