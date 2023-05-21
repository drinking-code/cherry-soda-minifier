import {type SourceMapInput} from '@jridgewell/trace-mapping'
import type {TransformOptions} from 'esbuild'

import type {MinimizedResult, PredefinedOptions} from './types.js'
import {formatNote} from '../utils.js'

export async function esbuildMinify(
    fileName: string, code: string,
    sourceMap: SourceMapInput | undefined,
    minimizerOptions: Partial<PredefinedOptions> & Partial<TransformOptions>
): Promise<MinimizedResult> {
    const esbuild = await import('esbuild')

    delete minimizerOptions.ecma;

    if (minimizerOptions.module) {
        minimizerOptions.format = 'esm'
    }

    delete minimizerOptions.module;

    // Copy `esbuild` options
    const esbuildOptions = {
        minify: true,
        legalComments: 'inline',
        ...minimizerOptions,
        sourcemap: false,
    } as TransformOptions

    // Let `esbuild` generate a SourceMap
    if (sourceMap) {
        esbuildOptions.sourcemap = true
        esbuildOptions.sourcesContent = false
    }

    esbuildOptions.sourcefile = fileName

    const result = await esbuild.transform(code, esbuildOptions)

    return {
        code: result.code,
        map: result.map ? JSON.parse(result.map) : undefined,
        warnings:
            result.warnings.length > 0
                ? result.warnings.map((item) => {
                    let formattedWarning = ''
                    formattedWarning += item.text
                    formattedWarning += ` [${item.id}]`
                    if (item.pluginName)
                        formattedWarning += `\nPlugin Name: ${item.pluginName}`
                    if (item.location) {
                        formattedWarning += `\n\n${item.location.file}:${item.location.line}:${item.location.column}:\n`
                        formattedWarning += `  ${item.location.line} | ${item.location.lineText}`
                        formattedWarning += `\n\nSuggestion: ${item.location.suggestion}`
                    }
                    if (item.detail)
                        formattedWarning += `\nDetails:\n${item.detail}`
                    if (item.notes.length > 0)
                        formattedWarning += `\n\nNotes:\n${item.notes.map(formatNote).join("\n")}`

                    return formattedWarning
                }) : [],
    }
}

esbuildMinify.getMinimizerVersion = (): string | undefined => {
    let packageJson

    try {
        packageJson = require('esbuild/package.json')
    } catch (error) {
        // Ignore
    }

    return packageJson && packageJson.version
};
