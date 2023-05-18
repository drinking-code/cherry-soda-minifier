import {type RawSourceMap} from 'source-map'
import {type ProcessOptions} from 'postcss'
import {type CompressOptions, type MinifyOptions} from 'csso'

import {type MinimizedResult} from './types.js'

export default async function cssoMinify(
    fileName: string, code: string,
    sourceMap: RawSourceMap | undefined,
    minimizerOptions: Partial<ProcessOptions> & Partial<MinifyOptions & CompressOptions>
): Promise<MinimizedResult> {
    const csso = await import('csso')
    const result = csso.minify(code, {
        fileName,
        sourceMap: Boolean(sourceMap),
        ...minimizerOptions,
    })

    return {
        code: result.css,
        map: result.map,
    } as MinimizedResult
}
