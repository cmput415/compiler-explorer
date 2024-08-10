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

import * as fs from 'fs';
import path from 'path';

import type {CompilationResult, ExecutionOptions} from '../../types/compilation/compilation.interfaces.js';
import type {PreliminaryCompilerInfo} from '../../types/compiler.interfaces.js';
import type {ParseFiltersAndOutputOptions} from '../../types/features/filters.interfaces.js';
import {gazpreaRuntime, ldPath} from '../415-env.js';
import {BaseCompiler} from '../base-compiler.js';

export class GazpreaCompiler extends BaseCompiler {
    static get key() {
        return 'gazc';
    }

    ccPath: string;
    irFile: string;
    outputFile: string;

    constructor(compiler: PreliminaryCompilerInfo, env) {
        super(compiler, env);

        // Paths for running compiler
        this.ccPath = this.compilerProps<string>(`compiler.${this.compiler.id}.cc`);

        // Intermediate files
        this.irFile = '/tmp/example.ll';
        this.outputFile = '/tmp/example.out';
    }

    override async runCompiler(
        compiler: string,
        options: string[],
        inputFilename: string,
        execOptions: ExecutionOptions & {env: Record<string, string>},
        filters?: ParseFiltersAndOutputOptions,
    ): Promise<CompilationResult> {
        // Prepare arguments and generate IR file
        const gazpreaArgs = [inputFilename, this.irFile];
        const gazpreaResult = await this.exec(compiler, gazpreaArgs, execOptions);

        if (gazpreaResult.code !== 0) {
            // Stop early for Compile Time errors
            return this.transformToCompilationResult(gazpreaResult, inputFilename);
        }

        // Prepare lli arguments, execution env and get the result
        const lliArgs = [this.irFile];
        const lliExecOptions: ExecutionOptions = {
            ...this.getDefaultExecOptions(),
            ldPath: [ldPath],
            env: {LD_PRELOAD: path.join(ldPath, gazpreaRuntime)},
            customCwd: path.dirname(this.irFile),
        };
        const lliResult = await this.exec('lli', lliArgs, lliExecOptions);

        // Write lli output to the output file
        if (lliResult.code === 0) {
            await fs.promises.writeFile(this.outputFile, lliResult.stdout);
        }

        // Combine results
        const combinedResult = {
            ...lliResult,
            code: lliResult.code,
            // Note: Somewhere Compiler Explorer strips the final newline for print programs.
            stdout: gazpreaResult.stdout + lliResult.stdout,
            stderr: gazpreaResult.stderr + lliResult.stderr,
        };

        return {
            ...this.transformToCompilationResult(combinedResult, inputFilename),
            languageId: this.getCompilerResultLanguageId(),
            instructionSet: this.getInstructionSetFromCompilerArgs(options),
        };
    }

    override getCompilerResultLanguageId() {
        return 'gazc';
    }

    override optionsForFilter(filters: ParseFiltersAndOutputOptions, outputFilename: any) {
        return [];
    }

    override getOutputFilename(dirPath: string, outputFilebase: string, key?: any): string {
        this.outputFile = path.join(dirPath, 'output.gaz');
        return this.outputFile;
    }
}
