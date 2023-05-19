import {type RawSourceMap} from 'source-map'
import postcss, {type  ProcessOptions} from 'postcss'
import {type Options} from 'cssnano'

import {type MinimizedResult} from './types.js'

export async function cssnanoMinify(
    fileName: string, code: string,
    sourceMap: RawSourceMap | undefined,
    minimizerOptions: Partial<ProcessOptions> & Partial<Options> = {}
): Promise<MinimizedResult> {
    const postcssOptions: ProcessOptions = {from: fileName,}
    if ('processorOptions' in minimizerOptions)
        Object.assign(postcssOptions, minimizerOptions.processorOptions)

    if (sourceMap)
        postcssOptions.map = {annotation: false}

    const cssnano = (await import('cssnano') as { default: Function }).default
    const result = await postcss([cssnano(minimizerOptions)])
        .process(code, postcssOptions)

    return {
        code: result.css,
        map: result.map?.toJSON(),
        warnings: result.warnings().map(String),
    } as MinimizedResult
}
