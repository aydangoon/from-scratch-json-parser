import { Parser } from './parser'

/**
 * Converts a JavaScript Object Notation (JSON) string into an object.
 * @param text A valid JSON string.
 */
export function parse(input: string): any {
    return new Parser(input).parse()
}
