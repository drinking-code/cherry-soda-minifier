import path from 'path'

import {type RawSourceMap} from 'source-map'
import {type ProcessOptions} from 'postcss'
import type CleanCSS from 'clean-css'
import {type Constructor} from 'clean-css'

import {type MinimizedResult} from './types.js'

export async function cleanCssMinify(
    fileName: string, code: string,
    sourceMap: RawSourceMap | undefined,
    minimizerOptions: Partial<ProcessOptions> & Partial<CleanCSS.OptionsPromise>
): Promise<MinimizedResult> {
    // const CleanCSS: Constructor = await import('clean-css')
    const CleanCSS: Constructor = require('clean-css')
    const result = await new CleanCSS({
        sourceMap: Boolean(sourceMap),
        ...minimizerOptions,
        returnPromise: true,
    } as CleanCSS.OptionsPromise).minify({
        [fileName]: {styles: code}
    })

    const generatedSourceMap = result.sourceMap && result.sourceMap.toJSON()

    // workaround for source maps on windows
    if (generatedSourceMap && path.sep === '\\') {
        for (let i = 0; i < generatedSourceMap.sources.length; i++) {
            generatedSourceMap.sources[i] = generatedSourceMap.sources[i].replaceAll(path.sep, '/')
        }
    }

    return {
        code: result.styles,
        map: generatedSourceMap,
        warnings: result.warnings,
    } as MinimizedResult
}
