// basic implementation of http protocol
import { CreateSafeEnum } from "../../safe-enum-factory"
import type { SafeEnum } from "../../types/interfaces/safe-enum"

// Define the HTTP methods as a const object for type safety
const httpProtocolMap = {
  GET: { value: "GET" as const, index: 0 },
  POST: { value: "POST" as const, index: 1 },
  PUT: { value: "PUT" as const, index: 2 },
  DELETE: { value: "DELETE" as const, index: 3 },
  PATCH: { value: "PATCH" as const, index: 4 },
  OPTIONS: { value: "OPTIONS" as const, index: 5 },
  HEAD: { value: "HEAD" as const, index: 6 }
} as const
export const HttpProtocol = CreateSafeEnum(httpProtocolMap, "HttpProtocol")
// Type for HttpProtocol enum values
export type HttpProtocolType = SafeEnum<"HttpProtocol">


const RolesMap = {
  ADMIN: { value: "ADMIN" as const, index: 0 },
  USER: { value: "USER" as const, index: 1 },
  GUEST: { value: "GUEST" as const, index: 2 }
} as const
export const Roles = CreateSafeEnum(RolesMap, "Roles")
// Type for Roles enum values
export type RolesType = SafeEnum<"Roles">
