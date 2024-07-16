import { GrammarError } from './errors'
import { Lexer } from './lexer'

type JFalse = false
type JTrue = true
type JNull = null
type JString = string
type JNumber = number
type JValue = JFalse | JTrue | JNull | JString | JNumber | JObject | JArray
type JArray = JValue[]
type JObject = { [key: JString]: JValue }

export class Parser {
    private lexer: Lexer

    constructor(input: string) {
        this.lexer = new Lexer(input)
    }

    parse(): JValue {
        return this.parseValue({ root: true })
    }

    private parseValue(options: { root: boolean } = { root: false }): JValue {
        const { root } = options
        const token = this.lexer.nextToken()
        if (!token) {
            throw new GrammarError('unexpected end of input')
        }

        let value: JValue

        switch (token.type) {
            case 'begin-object':
                value = this.parseObject()
                break
            case 'begin-array':
                value = this.parseArray()
                break
            case 'string':
                value = token.value
                break
            case 'number':
                value = token.value
                break
            case 'true':
                value = true
                break
            case 'false':
                value = false
                break
            case 'null':
                value = null
                break
            default:
                throw new GrammarError(`unexpected token ${token.type}`)
        }

        if (root && this.lexer.hasNextToken()) {
            throw new GrammarError('unexpected tokens after parsing root')
        }

        return value
    }

    private parseObject(): JObject {
        const obj: JObject = {}
        let token = this.lexer.nextToken()
        if (token?.type === 'end-object') {
            return obj
        }
        while (true) {
            if (!token) {
                throw new GrammarError('unexpected end of input')
            }
            if (token.type !== 'string') {
                throw new GrammarError(`unexpected token ${token.type}, expected string`)
            }

            const key = token.value

            if (key in obj) {
                throw new Error(`duplicate key ${key}`)
            }

            if (this.lexer.nextToken()?.type !== 'name-separator') {
                throw new GrammarError('unexpected token, expected name-separator')
            }

            const value = this.parseValue()

            obj[key] = value

            token = this.lexer.nextToken()

            if (token?.type === 'end-object') {
                break
            }

            if (token?.type !== 'value-separator') {
                throw new GrammarError('unexpected token, expected value-separator')
            }

            token = this.lexer.nextToken()
        }
        return obj
    }

    private parseArray(): JArray {
        const arr: JArray = []
        let token = this.lexer.peekNextToken()
        if (token?.type === 'end-array') {
            this.lexer.nextToken()
            return arr
        }
        while (token?.type !== 'end-array') {
            arr.push(this.parseValue())
            token = this.lexer.nextToken()
            if (token?.type !== 'end-array' && token?.type !== 'value-separator') {
                throw new GrammarError('unexpected token, expected value-separator or end-array')
            }
        }
        return arr
    }
}
