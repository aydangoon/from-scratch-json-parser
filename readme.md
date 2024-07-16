# From Scratch: JSON Parser
A parser for json as specified by [rfc 8259](https://datatracker.ietf.org/doc/html/rfc8259#section-8.1).

This package exports a single function `parse(input: string): any` that functions equivalently to `JSON.parse` except:
1. there is no reviver parameter
2. the error messages are different

## Dev Log
*notes on the development process! Hurdles, things I learned, etc.*

### 16.07.24
Started lexer, implemented tokenization for structural characters (`[`, `{`, etc.), literals, and strings. Trickiest part was unicode characters outside of the BMP as I did not know javascript represents stores them as 2 "characters" (really 16 bit UTF-16 code points) under the hood! Only by converting a string to an array can you iterate over the characters individual 32 bit unicode value.
```javascript
> const a = '😀'
> a.length
2 // huh??
> const b = [...a]
> b.length
1 // ok makes sense
```