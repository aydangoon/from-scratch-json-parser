import { GrammarError } from '../src/errors'
import { Parser } from '../src/parser'

describe('parse primitives', () => {
    it('true', () => {
        expect(new Parser('true').parse()).toBe(true)
    })
    it('false', () => {
        expect(new Parser('false').parse()).toBe(false)
    })
    it('null', () => {
        expect(new Parser('null').parse()).toBe(null)
    })
    it('literal with leading and trailing whitespace', () => {
        expect(new Parser('  \n\t  true  \n\t  ').parse()).toBe(true)
    })

    it('throw errors for invalid literals', () => {
        expect(() => new Parser('tru').parse()).toThrow()
        expect(() => new Parser('fals').parse()).toThrow()
        expect(() => new Parser('nul').parse()).toThrow()
    })

    it('valid string', () => {
        expect(new Parser('"hello"').parse()).toBe('hello')
    })
    it('valid number', () => {
        expect(new Parser('123.02e-2').parse()).toBe(1.2302)
    })
    it('huge number', () => {
        const input = '-9223372036854775807'
        const expected = JSON.parse(input)
        expect(new Parser(input).parse()).toBe(expected)
    })
})

describe('parse simple arrays', () => {
    it('empty array', () => {
        expect(new Parser('[]').parse()).toEqual([])
    })
    it('array with single element', () => {
        expect(new Parser('[true]').parse()).toEqual([true])
    })
    it('array with multiple elements', () => {
        expect(new Parser('[true, false, null]').parse()).toEqual([true, false, null])
    })
})

describe('parse simple objects', () => {
    it('empty object', () => {
        expect(new Parser('{}').parse()).toEqual({})
    })
    it('object with single key-value pair', () => {
        const input = `{ "key": "value" }`
        expect(new Parser(input).parse()).toEqual({ key: 'value' })
    })
    it('object with multiple key-value pairs', () => {
        const input = `{ "key1": "value1", "key2": false, "key3": null }`
        const expected = JSON.parse(input)
        expect(new Parser(input).parse()).toEqual(expected)
    })
    it('trailing comma throws error', () => {
        expect(() => new Parser('{ "key": "value", }').parse()).toThrow(GrammarError)
    })
    it('duplicate keys throws error', () => {
        expect(() => new Parser('{ "key": "value", "key": "value" }').parse()).toThrow()
    })
    it('strange key names', () => {
        const input = `{"é":"NFC","é":"NFD"}`
        const expected = JSON.parse(input)
        expect(new Parser(input).parse()).toEqual(expected)
    })
})

describe('parse nested structures', () => {
    it('array of arrays', () => {
        const input = `[[], [true], false, [1, 2, "hi"]]`
        const expected = JSON.parse(input)
        expect(new Parser(input).parse()).toEqual(expected)
    })
    it('deeply nested arrays', () => {
        const input = `[[[[]], 1]]`
        const expected = JSON.parse(input)
        expect(new Parser(input).parse()).toEqual(expected)
    })
    it('object of objects', () => {
        const input = `{ "obj1": {}, "obj2": { "key": "value" } }`
        const expected = JSON.parse(input)
        expect(new Parser(input).parse()).toEqual(expected)
    })
    it('object with nested arrays', () => {
        const input = `
            {
                "a": [1, { "b": [2, 3] }],
                "b": [4, 5],
                "c": { "d": 6 },
                "e": [{ "f": {"g": 7} }]
            }
        `
        const expected = JSON.parse(input)
        expect(new Parser(input).parse()).toEqual(expected)
    })
})
