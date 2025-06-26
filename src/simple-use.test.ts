import { describe, it, expect } from 'vitest'
import { HttpProtocol } from './example-enum'

describe("HttpProtocol", () => {
    it("should have correct values", () => {
        expect(HttpProtocol.GET.value).toBe("get")
        expect(HttpProtocol.GET.index).toBe(0)
        expect(HttpProtocol.GET.key).toBe("GET")
    })
    it('should use the type correctly', () => {
        const getRequest: HttpProtocol = HttpProtocol.GET
        const postRequest: HttpProtocol = HttpProtocol.POST
        expect(getRequest).toBe(HttpProtocol.GET)
        expect(postRequest).toBe(HttpProtocol.POST)
    })
})
    