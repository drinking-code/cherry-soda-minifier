import {type SourceMapInput} from '@jridgewell/trace-mapping'
import type {MinifyOptions, CompressOptions, FormatOptions} from 'terser'

import type {ExtractCommentsOptions, MinimizedResult, PredefinedOptions,} from './types.js'

import {buildComments} from '../utils.js'

export async function terserMinify(
    fileName: string, code: string,
    sourceMap: SourceMapInput | undefined,
    minimizerOptions: Partial<PredefinedOptions> & Partial<MinifyOptions>,
    extractComments: ExtractCommentsOptions
): Promise<MinimizedResult> {
    const {minify} = await import('terser')
    // Copy `terser` options
    const terserOptions = buildTerserOptions(minimizerOptions)

    // Let terser generate a SourceMap
    if (sourceMap) {
        // @ts-ignore
        terserOptions.sourceMap = {asObject: true};
    }

    const extractedComments: Array<string> = [];

    if (terserOptions.output) {
        terserOptions.output.comments = buildComments(
            terserOptions as Partial<{[p: string]: any}>,
            extractedComments,
            extractComments
        );
    } else if (terserOptions.format) {
        terserOptions.format.comments = buildComments(
            terserOptions as Partial<{[p: string]: any}> ,
            extractedComments,
            extractComments
        );
    }

    if (terserOptions.compress) {
        // More optimizations
        if (typeof terserOptions.compress.ecma === "undefined") {
            terserOptions.compress.ecma = terserOptions.ecma;
        }

        // https://github.com/webpack/webpack/issues/16135
        if (
            terserOptions.ecma === 5 &&
            typeof terserOptions.compress.arrows === "undefined"
        ) {
            terserOptions.compress.arrows = false;
        }
    }

    const result = await minify({[fileName]: code}, terserOptions)

    return {
        code: result.code as string,
        map: result.map ? (result.map as SourceMapInput) : undefined,
        extractedComments,
    } as MinimizedResult
}

terserMinify.getMinimizerVersion = (): string | undefined => {
    let packageJson

    try {
        packageJson = require('terser/package.json')
    } catch (error) {
        // Ignore
    }

    return packageJson && packageJson.version
}

export type TerserOptions = MinifyOptions &
    { sourceMap: undefined } &
    { compress: CompressOptions } &
    ({ output: FormatOptions & { beautify: boolean } } | { format: FormatOptions & { beautify: boolean } })

function buildTerserOptions(terserOptions: Partial<PredefinedOptions> & Partial<MinifyOptions> = {}): TerserOptions {
    return {
        ...terserOptions,
        compress:
            typeof terserOptions.compress === 'boolean'
                ? terserOptions.compress
                    ? {}
                    : false
                : {...terserOptions.compress},
        // ecma: terserOptions.ecma,
        // ie8: terserOptions.ie8,
        // keep_classnames: terserOptions.keep_classnames,
        // keep_fnames: terserOptions.keep_fnames,
        mangle:
            terserOptions.mangle === null
                ? true
                : typeof terserOptions.mangle === 'boolean'
                    ? terserOptions.mangle
                    : {...terserOptions.mangle},
        // module: terserOptions.module,
        // nameCache: { ...terserOptions.toplevel },
        // the `output` option is deprecated
        ...(terserOptions.format
            ? {format: {beautify: false, ...terserOptions.format}}
            : {output: {beautify: false, ...terserOptions.output}}),
        parse: {...terserOptions.parse},
        // safari10: terserOptions.safari10,
        // Ignoring sourceMap from options
        sourceMap: undefined,
        // toplevel: terserOptions.toplevel
    } as TerserOptions
}
