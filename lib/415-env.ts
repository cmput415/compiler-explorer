/// These environment variables should be set by the docker container
/// our fork of Compiler-Explorer is launched with.

export const ldPath: string = process.env.LD_PATH ?? '';
export const vcalcRuntime: string = process.env.VCALC_RUNTIME ?? '';
export const gazpreaRuntime: string = process.env.GAZPREA_RUNTIME ?? '';
