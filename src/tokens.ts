export type BeginArrayToken = { type: 'begin-array' }
export type EndArrayToken = { type: 'end-array' }
export type BeginObjectToken = { type: 'begin-object' }
export type EndObjectToken = { type: 'end-object' }
export type NameSeparatorToken = { type: 'name-separator' }
export type ValueSeparatorToken = { type: 'value-separator' }

export type TrueToken = { type: 'true' }
export type FalseToken = { type: 'false' }
export type NullToken = { type: 'null' }

export type StringToken = { type: 'string'; value: string }

export type NumberToken = { type: 'number'; value: number }

export type Token =
    | BeginArrayToken
    | EndArrayToken
    | BeginObjectToken
    | EndObjectToken
    | NameSeparatorToken
    | ValueSeparatorToken
    | TrueToken
    | FalseToken
    | NullToken
    | StringToken
    | NumberToken
