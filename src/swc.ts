import {type RawSourceMap} from 'source-map'
import {type ProcessOptions} from 'postcss'
import {type Options} from '@swc/css'

import {type MinimizedResult} from './types.js'

export default async function swcMinify(
    fileName: string, code: string,
    sourceMap: RawSourceMap | undefined,
    minimizerOptions: Partial<ProcessOptions> & Partial<Options> = {}
): Promise<MinimizedResult> {
    const swc = await import('@swc/css')

    // Copy `swc` options
    const swcOptions: Options = {...minimizerOptions, fileName} as Options

    // Let `swc` generate a SourceMap
    if (sourceMap) {
        swcOptions.sourceMap = true
    }

    const result = await swc.minify(Buffer.from(code), swcOptions)

    return {
        code: result.code.toString(),
        map: result.map ? JSON.parse(result.map.toString()) : undefined,
        errors: result.errors
            ? result.errors.map((diagnostic) => {
                const error = new Error(diagnostic.message)
                // @ts-ignore
                error.span = diagnostic.span
                // @ts-ignore
                error.level = diagnostic.level

                return error
            })
            : undefined,
    }
}
