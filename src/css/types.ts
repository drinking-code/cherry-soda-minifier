import {type RawSourceMap} from 'source-map'
import type {Parser, ProcessOptions, Stringifier, Syntax} from 'postcss'

import type CleanCSS from 'clean-css'
import {type TransformOptions as TransformOptionsEsBuild} from 'esbuild'
import {type Options as OptionsCssNano} from 'cssnano'
import {type CompressOptions, type MinifyOptions} from 'csso'
import {type TransformOptions as TransformOptionsLightningCss, type CustomAtRules} from 'lightningcss'
import {type Options as OptionsSwcCss} from '@swc/css'

export interface CssNanoOptions {
    configFile?: string
    preset?: [string, object] | string | undefined
}

export type ProcessOptionsExtender = ProcessOptions | {
    from?: string,
    to?: string,
    parser?: string | Syntax | Parser,
    stringifier?: string | Syntax | Stringifier,
    syntax?: string | Syntax
}

type CustomOptions = Partial<ProcessOptions> & (
    Partial<CleanCSS.OptionsPromise> |
    Partial<TransformOptionsEsBuild> |
    Partial<OptionsCssNano> |
    Partial<MinifyOptions & CompressOptions> |
    Partial<TransformOptionsLightningCss<CustomAtRules>> |
    Partial<OptionsSwcCss>
    )
export type InferDefaultType<T> = T extends infer U ? U : CustomOptions

export declare function BasicMinimizerImplementation<T>(
    fileName: string, code: string,
    sourceMap: RawSourceMap | undefined,
    minifyOptions: InferDefaultType<T>
): Promise<MinimizedResult>

export type CssNanoOptionsExtended = CssNanoOptions & { processorOptions?: ProcessOptionsExtender }
export type MinimizerImplementation<T> = T extends any[]
    ? { [P in keyof T]: typeof BasicMinimizerImplementation<T[P]> }
    : typeof BasicMinimizerImplementation<T>
export type MinimizerOptions<T> = T extends any[] ? { [P in keyof T]?: InferDefaultType<T[P]> } : InferDefaultType<T>
export type DefinedDefaultMinimizerAndOptions<T> =
    T extends CssNanoOptionsExtended
        ? { minify?: MinimizerImplementation<T> | undefined, minimizerOptions?: MinimizerOptions<T> | undefined }
        : { minify: MinimizerImplementation<T>, minimizerOptions?: MinimizerOptions<T> | undefined }

export type Rule = RegExp | string
export type WarningsFilter = (warning: Warning | WarningObject | string, file: string, source?: string) => boolean
export type Parallel = undefined | boolean | number
export interface BasePluginOptions {
    test?: Rule
    include?: Rule
    exclude?: Rule
    warningsFilter?: WarningsFilter
    parallel?: Parallel
}

export interface ErrorObject {
    message: string
    line?: number
    column?: number
    stack?: string
}

export type Warning = Error & { plugin?: string, text?: string, source?: string } | string

export interface WarningObject {
    message: string
    plugin?: string
    text?: string
    line?: number
    column?: number
}

export interface MinimizedResult {
    code: string
    map: RawSourceMap
    errors?: Array<Error | ErrorObject | string>
    warnings?: Array<Warning | WarningObject | string>
}
