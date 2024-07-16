export class TokenParsingError extends Error {
    constructor(message?: string) {
        super(message)
        this.name = 'TokenParsingError'
    }
}
