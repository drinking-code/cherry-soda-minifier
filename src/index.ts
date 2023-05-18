import {type Plugin} from 'esbuild'

import type {BasePluginOptions, DefinedDefaultMinimizerAndOptions} from './types.js'

import cssnanoMinify from './cssnano'
import cssoMinify from './csso'
import cleanCssMinify from './clean-css'
import esbuildMinify from './esbuild'
import lightningCssMinify from './lightning-css'
import swcMinify from './swc'

export default function cssMinifierPlugin<T>(options?: BasePluginOptions & DefinedDefaultMinimizerAndOptions<T>): Plugin {
    return {
        name: 'css-minifier-plugin',
        setup(build) {
            build.onEnd(result => {
                console.log(result)
            })
        }
    }
}
