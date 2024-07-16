import { Parser } from './parser'

export function parse(input: string): any {
    return new Parser(input).parse()
}
