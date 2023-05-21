import {type OutputFile, type Plugin} from 'esbuild'

import type {BasePluginOptions as BasePluginOptionsCss, DefinedDefaultMinimizerAndOptions as DefinedDefaultMinimizerAndOptionsCss} from './css/types.js'
import type {BasePluginOptions as BasePluginOptionsJs, DefinedDefaultMinimizerAndOptions as DefinedDefaultMinimizerAndOptionsJs} from './js/types.js'

import {cssnanoMinify} from './css/cssnano'

export * as CssMinifiers from './css/index'

export function cssMinifierPlugin<T>(options?: BasePluginOptionsCss & DefinedDefaultMinimizerAndOptionsCss<T>): Plugin {
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
                    if (!outputFiles[i].path.match(options.test as RegExp)) continue
                    let css = outputFiles[i].text
                    let j = 0
                    for (const transformer of options.minify) {
                        // todo: sourcemaps
                        const result = await transformer(
                            outputFiles[i].path, css, undefined,
                            (options.minimizerOptions as Exclude<typeof options['minimizerOptions'], undefined>)[j] ?? {}
                        )
                        css = result.code
                        j++
                    }
                    outputFiles[i].contents = new TextEncoder('utf-8').encode(css)
                }
            })
        }
    }
}

import {terserMinify} from './js/terser'
import {BasicMinimizerImplementation} from './js/types.js'

export * as JsMinifiers from './js/index'

export function jsMinifierPlugin<T>(options?: BasePluginOptionsJs & DefinedDefaultMinimizerAndOptionsJs<T>): Plugin {
    return {
        name: 'js-minifier-plugin',
        setup(build) {
            options ??= {}
            options.minify ??= terserMinify
            options.terserOptions ??= {}
            options.test ??= /\.[cm]?js(\?.*)?$/i
            options.extractComments ??= () => true
            // options.parallel ??= true

            if (!Array.isArray(options.minify))
                options.minify = [options.minify]
            if (!Array.isArray(options.terserOptions))
                options.terserOptions = [options.terserOptions]

            build.onEnd(async result => {
                if (!result.outputFiles) return
                const outputFiles: OutputFile[] = result.outputFiles as OutputFile[]
                for (let i = 0; i < outputFiles?.length; i++) {
                    if (!outputFiles[i].path.match(options.test as RegExp)) continue
                    let css = outputFiles[i].text
                    let j = 0
                    for (const transformer: typeof BasicMinimizerImplementation of options.minify) {
                        // todo: sourcemaps
                        const result = await transformer(
                            outputFiles[i].path, css, undefined,
                            (options.terserOptions as Exclude<typeof options['terserOptions'], undefined>)[j] ?? {},
                            options.extractComments
                        )
                        css = result.code
                        j++
                    }
                    outputFiles[i].contents = new TextEncoder('utf-8').encode(css)
                }
            })
        }
    }
}
