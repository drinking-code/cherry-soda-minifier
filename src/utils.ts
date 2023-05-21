import type {ExtractCommentsCondition, ExtractCommentsFunction, ExtractCommentsOptions} from './js/types.js'
import type {Note} from 'esbuild'

export function isObject(value: any): value is object {
    return value != null && (typeof value === "object" || typeof value === "function")
}

export function formatNote(note: Note) {
    let formattedNote = ''
    if (note.location)
        formattedNote += `[${note.location.file}:${note.location.line}:${note.location.column}] `
    formattedNote += note.text
    if (note.location) {
        formattedNote += `\nSuggestion: ${note.location.suggestion}`
        formattedNote += `\nLine text:\n${note.location.lineText}\n`
    }
}

export function buildComments(options: Partial<{ [key: string]: any}>, extractedComments: Array<string>, extractComments?: ExtractCommentsOptions): typeof ExtractCommentsFunction {
    const condition: { [index: string]: ExtractCommentsCondition } = {}

    let comments
    if (options.format) {
        comments = options.format.comments
    } else if (options.output) {
        comments = options.output.comments
    }

    condition.preserve = typeof comments !== 'undefined' ? comments : false

    if (typeof extractComments === 'boolean' && extractComments) {
        condition.extract = 'some'
    } else if (typeof extractComments === 'string' || extractComments instanceof RegExp) {
        condition.extract = extractComments
    } else if (typeof extractComments === 'function') {
        condition.extract = extractComments
    } else if (extractComments && isObject(extractComments)) {
        condition.extract =
            typeof extractComments.condition === 'boolean' &&
            extractComments.condition
                ? 'some'
                : typeof extractComments.condition !== 'undefined'
                    ? extractComments.condition
                    : 'some'
    } else {
        // No extract
        // Preserve using "commentsOpts" or "some"
        condition.preserve = typeof comments !== 'undefined' ? comments : 'some'
        condition.extract = false
    }

    // Ensure that both conditions are functions
    ['preserve', 'extract'].forEach((key) => {
        let regexStr: undefined | string
        let regex: undefined | RegExp

        switch (typeof condition[key]) {
            case 'boolean':
                condition[key] = condition[key] ? () => true : () => false
                break
            case 'function':
                break
            case 'string':
                if (condition[key] === 'all') {
                    condition[key] = () => true
                    break
                }

                if (condition[key] === 'some') {
                    condition[key] = ((astNode, comment) =>
                            (comment.type === 'comment2' || comment.type === 'comment1') && /@preserve|@lic|@cc_on|^\**!/i.test(comment.value)
                    ) as typeof ExtractCommentsFunction
                    break
                }

                regexStr = condition[key] as string

                condition[key] = ((astNode, comment) =>
                        new RegExp(regexStr as string).test(comment.value)
                ) as typeof ExtractCommentsFunction
                break
            default:
                regex = condition[key] as RegExp

                condition[key] = ((astNode, comment) =>
                        (regex as RegExp).test(comment.value)
                ) as typeof ExtractCommentsFunction
        }
    });

    // Redefine the comments function to extract and preserve
    // comments according to the two conditions
    return (astNode, comment) => {
        if ((condition as { extract: typeof ExtractCommentsFunction }).extract(astNode, comment)) {
            const commentText =
                comment.type === 'comment2'
                    ? `/*${comment.value}*/`
                    : `//${comment.value}`

            // Don't include duplicate comments
            if (!extractedComments.includes(commentText)) {
                extractedComments.push(commentText)
            }
        }

        return (condition as { preserve: typeof ExtractCommentsFunction }).preserve(astNode, comment)
    }
}
