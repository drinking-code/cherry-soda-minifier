import {type OutputFile, type Plugin} from 'esbuild'

import type {BasePluginOptions, DefinedDefaultMinimizerAndOptions} from './types.js'

export {cssnanoMinify} from './cssnano'
export {cssoMinify} from './csso'
export {cleanCssMinify} from './clean-css'
export {esbuildMinify} from './esbuild'
export {lightningCssMinify} from './lightning-css'
export {swcMinify} from './swc'

export default function cssMinifierPlugin<T>(options?: BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>): Plugin {
    return {
        name: 'css-minifier-plugin',
        setup(build) {
            options ??= {}
            options.minify ??= cssnanoMinify
            options.minimizerOptions ??= {}
            options.test ??= /\.css(\?.*)?$/i
            options.warningsFilter ??= () => true
            // options.parallel ??= true

            if (!Array.isArray(options.minify))
                options.minify = [options.minify]
            if (!Array.isArray(options.minimizerOptions))
                options.minimizerOptions = [options.minimizerOptions]

            build.onEnd(async result => {
                if (!result.outputFiles) return
                const outputFiles: OutputFile[] = result.outputFiles as OutputFile[]
                for (let i = 0; i < outputFiles?.length; i++) {
                    if (!outputFiles[i].path.match(options.test)) continue
                    let css = outputFiles[i].text
                    let j = 0
                    for (const transformer of options.minify) {
                        // todo: sourcemaps
                        const result = await transformer(outputFiles[i].path, css, undefined, options.minimizerOptions[i] ?? {})
                        css = result.code
                        j++
                    }
                    // const lengthBefore = outputFiles[i].text.length
                    outputFiles[i].contents = new TextEncoder('utf-8').encode(css)
                    // const lengthAfter = outputFiles[i].text.length
                    // console.log(lengthBefore, lengthAfter)
                }
            })
        }
    }
}
