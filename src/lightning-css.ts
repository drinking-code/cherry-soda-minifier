import {type RawSourceMap} from 'source-map'
import {type ProcessOptions} from 'postcss'
import {type TransformOptions, type CustomAtRules} from 'lightningcss'

import {type MinimizedResult} from './types.js'

export async function lightningCssMinify(
    fileName: string, code: string,
    sourceMap: RawSourceMap | undefined,
    minimizerOptions: Partial<ProcessOptions> & Partial<TransformOptions<CustomAtRules>> = {}
): Promise<MinimizedResult> {
    const lightningCss = await import('lightningcss')

    const lightningCssOptions: TransformOptions<CustomAtRules> = {
        minify: true,
        ...minimizerOptions,
        sourceMap: false,
        fileName,
        code: Buffer.from(code),
    } as TransformOptions<CustomAtRules>

    if (sourceMap) {
        lightningCssOptions.sourceMap = true
    }

    const result = await lightningCss.transform(lightningCssOptions)

    return {
        code: result.code.toString(),
        map: result.map ? JSON.parse(result.map.toString()) : undefined,
    };
}
