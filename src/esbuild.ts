import {type RawSourceMap} from 'source-map'
import {type ProcessOptions} from 'postcss'
import {type TransformOptions} from 'esbuild'

import {type MinimizedResult} from './types.js'

export default async function esbuildMinify(
    fileName: string, code: string,
    sourceMap: RawSourceMap | undefined,
    minimizerOptions: Partial<ProcessOptions> & Partial<TransformOptions> = {}
): Promise<MinimizedResult> {
    const esbuild = await import('esbuild')

    const esbuildOptions = {
        loader: 'css',
        minify: true,
        legalComments: 'inline',
        ...minimizerOptions,
        sourcemap: false,
    }

    if (sourceMap) {
        esbuildOptions.sourcemap = true
        esbuildOptions.sourcesContent = false
    }

    esbuildOptions.sourcefile = fileName

    const result = await esbuild.transform(code, esbuildOptions as TransformOptions)

    return {
        code: result.code,
        map: result.map ? JSON.parse(result.map) : undefined,
        warnings: result.warnings.length > 0 ? result.warnings.map(transformWarningMessage) : [],
    }
}

function transformWarningMessage(item) {
    return {
        source: item.location?.file,
        line: item.location?.line,
        column: item.location?.column,
        plugin: item.pluginName,
        message: item.text +
            (item.detail ? `\nDetails:\n${item.detail}` : '') +
            (item.notes.length > 0 ? `\n\nNotes:\n${item.notes.map(formatNote).join("\n")}` : ''),
    }
}

function formatNote(note) {
    let formattedNote = ''
    if (note.location)
        formattedNote += `[${note.location.file}:${note.location.line}:${note.location.column}] `
    formattedNote += note.text
    if (note.location) {
        formattedNote += `\nSuggestion: ${note.location.suggestion}`
        formattedNote += `\nLine text:\n${note.location.lineText}\n`
    }
    return formattedNote
}
