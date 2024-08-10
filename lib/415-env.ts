/// These environment variables should be set by the docker container
/// our fork of Compiler-Explorer is launched with.

export const lliPath: string = process.env.LLI_PATH ?? '';
export const ldPath: string = process.env.LD_PATH ?? '';
export const binPath: string = process.env.BIN_PATH ?? '';

export const generatorExe: string = process.env.GENERATOR_EXE ?? '';
export const scalcExe: string = process.env.SCALC_EXE ?? '';
export const vcalcExe: string = process.env.VCALC_EXE ?? '';
export const gazpreaExe: string = process.env.GAZPREA_EXE ?? '';

export const vcalcRuntime: string = process.env.VCALC_RUNTIME ?? '';
export const gazpreaRuntime: string = process.env.GAZPREA_RUNTIME ?? '';
