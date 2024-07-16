// as defined in: https://datatracker.ietf.org/doc/html/rfc8259
import { TokenParsingError } from './errors'
import { NumberToken, StringToken, Token } from './tokens'

/**
 * a lexer that reads a JSON string and produces a stream of tokens
 */
export class Lexer {
    private readonly characters: string[]
    private index: number

    constructor(json: string) {
        this.index = 0
        this.characters = [...json] // convert string to array of characters, fixes surrogate code point pairs
    }

    hasNextToken(): boolean {
        if (this.empty()) {
            return false
        }
        let i = this.index
        while (i < this.characters.length && WhitespaceSet.has(this.characters[i])) {
            i++
        }
        return i < this.characters.length
    }

    /**
     * returns the next token and consumes it
     */
    nextToken(): Token | null {
        if (!this.hasNextToken()) {
            return null
        }

        this.skipWhitespace()

        // structural characters
        if (this.peek() === '[') {
            this.index++
            return { type: 'begin-array' }
        } else if (this.peek() === ']') {
            this.index++
            return { type: 'end-array' }
        } else if (this.peek() === '{') {
            this.index++
            return { type: 'begin-object' }
        } else if (this.peek() === '}') {
            this.index++
            return { type: 'end-object' }
        } else if (this.peek() === ':') {
            this.index++
            return { type: 'name-separator' }
        } else if (this.peek() === ',') {
            this.index++
            return { type: 'value-separator' }
        }

        // literals
        if (this.characters.slice(this.index, this.index + 4).join('') === 'true') {
            this.index += 4
            return { type: 'true' }
        } else if (this.characters.slice(this.index, this.index + 5).join('') === 'false') {
            this.index += 5
            return { type: 'false' }
        } else if (this.characters.slice(this.index, this.index + 4).join('') === 'null') {
            this.index += 4
            return { type: 'null' }
        }

        if (this.peek() === '"') {
            return this.consumeString()
        }

        return this.consumeNumber()
    }

    /**
     * returns true if there are no more characters to consume
     */
    private empty(): boolean {
        return this.index >= this.characters.length
    }

    private peek(): string | undefined {
        return this.characters.at(this.index)
    }

    private skipWhitespace() {
        while (!this.empty() && WhitespaceSet.has(this.characters[this.index])) {
            this.index++
        }
    }

    private consumeString(): StringToken {
        let value = ''
        this.index++ // consume opening quotation mark

        let char: string | undefined
        while ((char = this.peek()) !== '"') {
            if (char === undefined) {
                throw new TokenParsingError('incomplete string, expected closing quotation mark')
            }

            if (char === '\\') {
                value += this.consumeStringEscapeSequence()
            } else {
                value += char
                this.index++
            }
        }

        this.index++ // consume closing quotation mark

        return { type: 'string', value }
    }

    private consumeStringEscapeSequence(): string {
        this.index++ // consume reverse solidus
        const escapedChar = this.peek()
        this.index++
        switch (escapedChar) {
            case '"':
            case '\\':
            case '/':
                return escapedChar
            case 'b':
                return '\b'
            case 'f':
                return '\f'
            case 'n':
                return '\n'
            case 'r':
                return '\r'
            case 't':
                return '\t'
            case 'u':
                let hex = ''
                let curr: string | undefined
                for (let i = 0; i < 4; i++) {
                    curr = this.peek()
                    if (curr === undefined) {
                        throw new TokenParsingError('incomplete unicode escape sequence')
                    }
                    if (!isHexDigit(curr)) {
                        throw new TokenParsingError(
                            'invalid unicode escape sequence, encountered non-hex digit',
                        )
                    }
                    hex += curr
                    this.index++
                }
                return String.fromCodePoint(parseInt(hex, 16))
        }
        throw new TokenParsingError('invalid escape sequence')
    }

    /**
     * consumes [ minus ] int [ frac ] [ exp ]
     */
    private consumeNumber(): NumberToken {
        let value = ''

        // optional minus sign
        if (this.peek() === '-') {
            value += '-'
            this.index++
        }

        // int
        value += this.consumeInt()

        // optional fraction
        if (this.peek() === '.') {
            value += this.consumeFraction()
        }

        // optional exponent
        if (this.peek() === 'e' || this.peek() === 'E') {
            value += this.consumeExponent()
        }

        return { type: 'number', value: Number(value) }
    }

    /**
     * consumes int = zero / ( digit1-9 *DIGIT )
     */
    private consumeInt() {
        let value = ''
        if (this.peek() === '0') {
            value += '0'
            this.index++
        } else {
            value += this.consumeDigits()
        }
        if (value === '') {
            throw new TokenParsingError('failed to parse integer, expected digit')
        }
        return value
    }

    /**
     * consumes frac = decimal-point 1*DIGIT
     */
    private consumeFraction() {
        let value = '.'
        this.index++
        value += this.consumeDigits()
        if (value === '.') {
            throw new TokenParsingError('failed to parse fraction, expected digit')
        }
        return value
    }

    /**
     * consumes exp = e [ minus / plus ] 1*DIGIT
     */
    private consumeExponent() {
        let value = 'e'
        this.index++
        if (this.peek() === '+' || this.peek() === '-') {
            value += this.peek()
            this.index++
        }
        value += this.consumeDigits()
        if (value === 'e' || value === 'e+' || value === 'e-') {
            throw new TokenParsingError('failed to parse exponent, expected digit')
        }
        return value
    }

    /**
     * consumes *DIGIT
     */
    private consumeDigits(): string {
        let value = ''
        while (!this.empty() && isDigit(this.peek()!)) {
            value += this.peek()
            this.index++
        }
        return value
    }
}

function isDigit(char: string): boolean {
    const codePoint = char.codePointAt(0)
    if (codePoint === undefined) {
        return false
    }
    return codePoint >= 0x30 && codePoint <= 0x39
}

function isHexDigit(char: string) {
    const code = char.charCodeAt(0)
    return (
        (code >= 48 && code <= 57) || // 0-9
        (code >= 65 && code <= 70) || // A-F
        (code >= 97 && code <= 102) // a-f
    )
}

const WhitespaceSet = new Set([...' \t\n\r'])
