import { TokenParsingError } from '../src/errors'
import { Lexer } from '../src/lexer'
import { Token } from '../src/tokens'

describe('lex literals', () => {
    it('single true token', () => {
        const lexer = new Lexer('true')
        expect(lexer.hasNextToken()).toBe(true)
        expect(lexer.nextToken()).toEqual({ type: 'true' })
        expect(lexer.hasNextToken()).toBe(false)
        expect(lexer.nextToken()).toBe(null)
    })

    it('single false token', () => {
        const lexer = new Lexer('false')
        expect(lexer.hasNextToken()).toBe(true)
        expect(lexer.nextToken()).toEqual({ type: 'false' })
        expect(lexer.hasNextToken()).toBe(false)
        expect(lexer.nextToken()).toBe(null)
    })

    it('single null token', () => {
        const lexer = new Lexer('null')
        expect(lexer.hasNextToken()).toBe(true)
        expect(lexer.nextToken()).toEqual({ type: 'null' })
        expect(lexer.hasNextToken()).toBe(false)
        expect(lexer.nextToken()).toBe(null)
    })

    it('literal with leading and trailing whitespace', () => {
        expect(new Lexer('  \n\t  true  \n\t  ').nextToken()).toEqual({ type: 'true' })
    })

    it('throw errors for invalid literals', () => {
        let lexer = new Lexer('tru')
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)

        lexer = new Lexer('fals')
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)

        lexer = new Lexer('nul')
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)
    })

    it('throw error for significant characters after literal', () => {
        let lexer = new Lexer('  true fal')
        expect(lexer.nextToken()).toEqual({ type: 'true' })
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)
    })
})

describe('lex structural characters', () => {
    it('single begin-array token', () => {
        const lexer = new Lexer('[')
        expect(lexer.hasNextToken()).toBe(true)
        expect(lexer.nextToken()).toEqual({ type: 'begin-array' })
        expect(lexer.hasNextToken()).toBe(false)
        expect(lexer.nextToken()).toBe(null)
    })

    it('multiple structural characters', () => {
        const lexer = new Lexer('[},:  ]\n{ ')
        const tokens: Token[] = []
        while (lexer.hasNextToken()) {
            tokens.push(lexer.nextToken()!)
        }
        expect(tokens).toEqual([
            { type: 'begin-array' },
            { type: 'end-object' },
            { type: 'value-separator' },
            { type: 'name-separator' },
            { type: 'end-array' },
            { type: 'begin-object' },
        ])
    })
})

describe('lex strings', () => {
    it('simple string', () => {
        const lexer = new Lexer('"hello"')
        expect(lexer.nextToken()).toEqual({ type: 'string', value: 'hello' })
    })

    it('string with escaped characters', () => {
        const lexer = new Lexer('"hello\\nworld"')
        const expectedValue = JSON.parse('"hello\\nworld"')
        expect(lexer.nextToken()).toEqual({ type: 'string', value: expectedValue })
    })

    it('string with unicode escape sequence', () => {
        const input = '"\\u0048\\u0065\\u006c\\u006c\\u006f"'
        const lexer = new Lexer(input)
        const expectedValue = JSON.parse(input)
        expect(lexer.nextToken()).toEqual({ type: 'string', value: expectedValue })
    })

    it('throws error for incomplete string', () => {
        const lexer = new Lexer('"incomplete')
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)
    })

    it('throws error for invalid escape sequence', () => {
        const lexer = new Lexer('"invalid\\xescape"')
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)
    })

    it('throws error for incomplete unicode escape sequence', () => {
        const lexer = new Lexer('"invalid\\u123"')
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)
    })

    it('throws error for invalid unicode escape sequence', () => {
        const lexer = new Lexer('"invalid\\u123x"')
        expect(() => lexer.nextToken()).toThrow(TokenParsingError)
    })
})
