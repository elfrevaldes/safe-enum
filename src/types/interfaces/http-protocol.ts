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
// Type for HttpProtocol enum values
export type HttpProtocolType = SafeEnum<"HttpProtocol">
export const HttpProtocolTypes = CreateSafeEnum(httpProtocolMap, "HttpProtocol")

const RolesMap = {
  ADMIN: { value: "ADMIN" as const, index: 0 },
  USER: { value: "USER" as const, index: 1 },
  GUEST: { value: "GUEST" as const, index: 2 }
} as const
// Type for Roles enum values
export type RoleType = SafeEnum<"Role">
export const RoleTypes = CreateSafeEnum(RolesMap, "Role")