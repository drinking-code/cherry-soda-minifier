import {type SourceMapInput} from '@jridgewell/trace-mapping'
import type {JsMinifyOptions, TerserCompressOptions} from '@swc/core'

import type {MinimizedResult, PredefinedOptions} from './types.js'

type SwcOptions = JsMinifyOptions & { sourceMap: undefined } & { compress: TerserCompressOptions }

export async function swcMinify(
    fileName: string, code: string,
    sourceMap: SourceMapInput | undefined,
    minimizerOptions: Partial<PredefinedOptions> & Partial<JsMinifyOptions>
): Promise<MinimizedResult> {
    const swc = await import('@swc/core')
    // Copy `swc` options
    const swcOptions = {
        ...minimizerOptions,
        compress:
            typeof minimizerOptions.compress === 'boolean'
                ? minimizerOptions.compress ? {} : false
                : {...minimizerOptions.compress},
        mangle:
            minimizerOptions.mangle == null
                ? true
                : typeof minimizerOptions.mangle === 'boolean'
                    ? minimizerOptions.mangle
                    : {...minimizerOptions.mangle},
        // ecma: swcOptions.ecma,
        // keep_classnames: swcOptions.keep_classnames,
        // keep_fnames: swcOptions.keep_fnames,
        // module: swcOptions.module,
        // safari10: swcOptions.safari10,
        // toplevel: swcOptions.toplevel
        sourceMap: undefined,
    } as SwcOptions

    // Let `swc` generate a SourceMap
    if (sourceMap) {
        // @ts-ignore
        swcOptions.sourceMap = true
    }

    if (swcOptions.compress) {
        // More optimizations
        if (typeof swcOptions.compress.ecma === 'undefined') {
            swcOptions.compress.ecma = swcOptions.ecma
        }

        // https://github.com/webpack/webpack/issues/16135
        if (swcOptions.ecma === 5 && typeof swcOptions.compress.arrows === 'undefined') {
            swcOptions.compress.arrows = false
        }
    }

    const result = await swc.minify(code, swcOptions)

    let map;

    if (result.map) {
        map = JSON.parse(result.map)

        // TODO workaround for swc because `filename` is not preset as in `swc` signature as for `terser`
        map.sources = [fileName]

        delete map.sourcesContent
    }

    return {
        code: result.code,
        map,
    }
}

swcMinify.getMinimizerVersion = (): string | undefined => {
    let packageJson

    try {
        packageJson = require('@swc/core/package.json')
    } catch (error) {
        // Ignore
    }

    return packageJson && packageJson.version
}
