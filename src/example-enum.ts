import { CreateSafeEnum } from "./safe-enum-factory";
import type { SafeEnum } from "./types/interfaces/safe-enum";

export const HttpProtocol = CreateSafeEnum({
    GET: { value: 'get', index: 0 },
    POST: { value: 'post', index: 1 },
    PUT: { value: 'put', index: 2 },
    DELETE: { value: 'delete', index: 3 }
} as const);

export type HttpProtocol = SafeEnum

