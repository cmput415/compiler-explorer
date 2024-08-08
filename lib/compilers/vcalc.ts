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
import {BaseCompiler} from '../base-compiler.js';

export class VCalcCompiler extends BaseCompiler {
    static get key() {
        return 'vcalc';
    }

    ccPath: string;
    libDir: string;
    libPath: string;
    lliPath: string;
    irFile: string;
    outputFile: string;

    constructor(compiler: PreliminaryCompilerInfo, env) {
        super(compiler, env);

        // Paths for running VCalc
        this.libDir = 'usr/lib';
        this.libPath = `${this.libDir}/vcalcrt.so`;
        this.ccPath = this.compilerProps<string>(`compiler.${this.compiler.id}.cc`);
        this.lliPath = '/home/justin/install/llvm/llvm-18/bin/lli';
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
        // Prepare VCalc arguments and generate IR file
        const vcalcArgs = [inputFilename, this.irFile];
        const vcalcResult = await this.exec(compiler, vcalcArgs, execOptions);

        if (vcalcResult.code !== 0) {
            // Stop early for Compile Time errors
            return this.transformToCompilationResult(vcalcResult, inputFilename);
        }

        // Prepare lli arguments, execution env and get the result
        const lliArgs = [this.irFile];
        const lliExecOptions: ExecutionOptions = {
            ...this.getDefaultExecOptions(),
            ldPath: [this.libDir],
            customCwd: path.dirname(this.irFile),
        };
        const lliResult = await this.exec(this.lliPath, lliArgs, lliExecOptions);

        // Write lli output to the output file
        if (lliResult.code === 0) {
            await fs.promises.writeFile(this.outputFile, lliResult.stdout);
        }

        // Combine results
        const combinedResult = {
            ...lliResult,
            code: lliResult.code,
            // Note: Somewhere Compiler Explorer strips the final newline for print programs.
            stdout: vcalcResult.stdout + lliResult.stdout,
            stderr: vcalcResult.stderr + lliResult.stderr,
        };

        return {
            ...this.transformToCompilationResult(combinedResult, inputFilename),
            languageId: this.getCompilerResultLanguageId(),
            instructionSet: this.getInstructionSetFromCompilerArgs(options),
        };
    }

    override getCompilerResultLanguageId() {
        return 'vcalc';
    }

    override optionsForFilter(filters: ParseFiltersAndOutputOptions, outputFilename: any) {
        return [];
    }

    override getOutputFilename(dirPath: string, outputFilebase: string, key?: any): string {
        this.outputFile = path.join(dirPath, 'output.vcalc');
        return this.outputFile;
    }
}
