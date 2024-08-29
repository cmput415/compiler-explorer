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
// LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
// CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
// INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
// CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
// ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
// POSSIBILITY OF SUCH DAMAGE.

import path from 'path';

import {ExecutionOptions} from '../../types/compilation/compilation.interfaces.js';
import type {PreliminaryCompilerInfo} from '../../types/compiler.interfaces.js';
import type {ParseFiltersAndOutputOptions} from '../../types/features/filters.interfaces.js';
import {BaseCompiler} from '../base-compiler.js';
import * as exec from '../exec.js';

export class GeneratorCompiler extends BaseCompiler {
    static get key() {
        return 'generator';
    }

    ccPath: string;
    outputFilename: string;

    constructor(compiler: PreliminaryCompilerInfo, env) {
        super(compiler, env);
        this.ccPath = this.compilerProps<string>(`compiler.${this.compiler.id}.cc`);
        this.outputFilename = '';
    }

    override getCompilerResultLanguageId() {
        return 'gen';
    }
    override async exec(filepath: string, args: string[], execOptions: ExecutionOptions) {
        const generatorArgs = [args[0], this.outputFilename];
        const execResult = await exec.execute(filepath, generatorArgs, execOptions);
        
        // Set custom stdout/err for if the program exection fails
        if (execResult.code != 0) {

            execResult.stdout = "";
            execResult.stderr = "Program Failed."
        }

        return execResult;
    }

    override optionsForFilter(filters: ParseFiltersAndOutputOptions, outputFilename: any) {
        this.outputFilename = outputFilename;
        return [outputFilename];
    }

    override getOutputFilename(dirPath: string, outputFilebase: string, key?: any): string {
        return path.join(dirPath, 'example.gen');
    }
}
