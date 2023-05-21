import {type SourceMapInput} from '@jridgewell/trace-mapping'
import type {ECMA, MinifyOptions as TerserMinifyOptions} from 'terser'
import type {MinifyOptions as UglifyMinifyOptions} from '@types/uglify-js'
import type {JsMinifyOptions as SwcMinifyOptions} from '@swc/core'
import type {TransformOptions} from 'esbuild'

import {type TerserOptions} from './terser.js'

export interface MinimizedResult {
    code: string
    map?: SourceMapInput
    errors?: Array<Error | string>
    warnings?: Array<Error | string>
    extractedComments?: Array<string>
}

export interface PredefinedOptions {
    module?: boolean
    ecma?: ECMA
}

export declare function ExtractCommentsFunction(
    astNode: any,
    comment: {
        value: string,
        type: 'comment1' | 'comment2' | 'comment3' | 'comment4',
        pos: number,
        line: number,
        col: number
    }
): boolean

export type ExtractCommentsCondition = boolean | 'all' | 'some' | RegExp | typeof ExtractCommentsFunction
export type ExtractCommentsFilename = string | ((fileData: any) => string)
export type ExtractCommentsBanner = boolean | string | ((commentsFile: string) => string)

export interface ExtractCommentsObject {
    condition?: ExtractCommentsCondition
    filename?: ExtractCommentsFilename
    banner?: ExtractCommentsBanner
}

export type ExtractCommentsOptions = ExtractCommentsCondition | ExtractCommentsObject

export type Parallel = undefined | boolean | number
export type Rule = RegExp | string
export type Rules = Rule[] | Rule

export interface BasePluginOptions {
    test?: Rules
    include?: Rules
    exclude?: Rules
    extractComments?: ExtractCommentsOptions
    parallel?: Parallel
}

type CustomOptions = Partial<PredefinedOptions> & (
    Partial<TerserMinifyOptions> |
    Partial<UglifyMinifyOptions> |
    Partial<SwcMinifyOptions> |
    Partial<TransformOptions>
    )

export declare function BasicMinimizerImplementation(
    fileName: string, code: string,
    sourceMap: SourceMapInput | undefined,
    minifyOptions: CustomOptions,
    extractComments: ExtractCommentsOptions | undefined
): Promise<MinimizedResult>

export interface MinimizeFunctionHelpers {
    getMinimizerVersion?: () => string | undefined
}

export type MinimizerImplementation = typeof BasicMinimizerImplementation & MinimizeFunctionHelpers
export type InferDefaultType<T> = T extends infer U ? U : CustomOptions
export type MinimizerOptions<T> = PredefinedOptions & InferDefaultType<T>
export type DefinedDefaultMinimizerAndOptions<T> = T extends TerserOptions ? {
    minify?: MinimizerImplementation | Array<MinimizerImplementation>,
    terserOptions?: MinimizerOptions<T>
} : {
    minify: MinimizerImplementation,
    terserOptions?: MinimizerOptions<T>
}

