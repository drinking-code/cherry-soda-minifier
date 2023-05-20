import {type SourceMapInput} from '@jridgewell/trace-mapping'
import {type MinifyOptions, type OutputOptions} from '@types/uglify-js'

import type {ExtractCommentsOptions, MinimizedResult, PredefinedOptions,} from './types.js'

import {buildComments} from './utils.js'

type UglifyJsOptions = MinifyOptions & { sourceMap: undefined } & { output: OutputOptions & { beautify: boolean } }

export async function uglifyJsMinify(
    fileName: string, code: string,
    sourceMap: SourceMapInput | undefined,
    minimizerOptions: Partial<PredefinedOptions> & Partial<MinifyOptions>,
    extractComments: ExtractCommentsOptions
): Promise<MinimizedResult> {

    // eslint-disable-next-line global-require, import/no-extraneous-dependencies
    const {minify} = await import('uglify-js')

    delete minimizerOptions.ecma
    delete minimizerOptions.module
    const uglifyJsOptions = {
        ...minimizerOptions,
        // warnings: uglifyJsOptions.warnings,
        parse: {...minimizerOptions.parse},
        compress:
            typeof minimizerOptions.compress === 'boolean'
                ? minimizerOptions.compress
                : {...minimizerOptions.compress},
        mangle:
            minimizerOptions.mangle == null
                ? true
                : typeof minimizerOptions.mangle === 'boolean'
                    ? minimizerOptions.mangle
                    : {...minimizerOptions.mangle},
        output: {beautify: false, ...minimizerOptions.output},
        // Ignoring sourceMap from options
        // eslint-disable-next-line no-undefined
        sourceMap: undefined,
        // toplevel: uglifyJsOptions.toplevel
        // nameCache: { ...uglifyJsOptions.toplevel },
        // ie8: uglifyJsOptions.ie8,
        // keep_fnames: uglifyJsOptions.keep_fnames,
    } as UglifyJsOptions

    // Let terser generate a SourceMap
    if (sourceMap) {
        // @ts-ignore
        uglifyJsOptions.sourceMap = true
    }

    const extractedComments: Array<string> = [];

    // @ts-ignore
    uglifyJsOptions.output.comments = buildComments(
        uglifyJsOptions,
        extractedComments,
        extractComments
    )

    const result = await minify({[fileName]: code}, uglifyJsOptions)

    return {
        code: result.code,
        // eslint-disable-next-line no-undefined
        map: result.map ? JSON.parse(result.map) : undefined,
        errors: result.error ? [result.error] : [],
        warnings: result.warnings || [],
        extractedComments,
    };
}
