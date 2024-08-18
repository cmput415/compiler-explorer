// Copyright (c) 2018, Adrian Bibby Walther
// All rights reserved.
//
// Redistribution and use in source and binary forms, with or without
// modification, are permitted provided that the following conditions are met:
//
//     * Redistributions of source code must retain the above copyright notice,
//       this list of conditions and the following disclaimer.
//     * Redistributions in binary form must reproduce the above copyright
//       notice, this list of conditions and the following disclaimer in the
//       documentation and/or other materials provided with the distribution.
//
// THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
// AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
// IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
// ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE
// SPDX-License-Identifier: BSD-3-Clause
// Copyright (c) 2023, Compiler Explorer Authors
// All rights reserved.

import fs from 'fs';
import path from 'path';

import type {ExecutionOptions} from '../../types/compilation/compilation.interfaces.js';
import type {PreliminaryCompilerInfo} from '../../types/compiler.interfaces.js';
import type {ParseFiltersAndOutputOptions} from '../../types/features/filters.interfaces.js';
import {ldPath, vcalcRuntime} from '../415-env.js';
import {BaseCompiler} from '../base-compiler.js';
import * as exec from '../exec.js';

export class VCalcCompiler extends BaseCompiler {
    static get key() {
        return 'vcalc';
    }

    ccPath: string;
    outputFile: string = '';
    irFile: string = '';

    constructor(compiler: PreliminaryCompilerInfo, env) {
        super(compiler, env);
        this.ccPath = this.compilerProps<string>(`compiler.${this.compiler.id}.cc`);
    }

    override async exec(filepath: string, args: string[], execOptions: ExecutionOptions) {
        const vcalcArgs = [args[0], this.irFile];
        const vcalcResult = await exec.execute(filepath, vcalcArgs, execOptions);

        const lliExecutionOptions = {
            ...this.getDefaultExecOptions(),
            ldPath: [ldPath],
            env: {LD_PRELOAD: path.join(ldPath, vcalcRuntime)},
            customCwd: path.dirname(this.irFile),
        };

        const lliArgs = [this.irFile];
        const lliResult = await exec.execute('lli', lliArgs, lliExecutionOptions);

        // Write lli output to the output file
        if (lliResult.code === 0) {
            await fs.promises.writeFile(this.outputFile, lliResult.stdout);
        }

        return vcalcResult;
    }

    override getCompilerResultLanguageId() {
        return 'vcalc';
    }

    override optionsForFilter(filters: ParseFiltersAndOutputOptions, outputFilename: any) {
        return [];
    }

    override getOutputFilename(dirPath: string, outputFilebase: string, key?: any): string {
        this.outputFile = path.join(dirPath, 'vcalc.out');
        this.irFile = path.join(dirPath, 'vcalc.ll');
        return this.outputFile;
    }
}
