import { CreateSafeEnumFromArray } from "./safe-enum-factory";
import { describe, it, expect } from 'vitest';

describe("CreateSafeEnumFromArray", () => {
  it("should create an enum from an array of strings", () => {
    const Status = CreateSafeEnumFromArray(["pending", "approved", "rejected"] as const);
    
    // Check that enum values are created correctly
    expect(Status.PENDING).toBeDefined();
    expect(Status.APPROVED).toBeDefined();
    expect(Status.REJECTED).toBeDefined();
    
    // Check values
    expect(Status.PENDING.value).toBe("pending");
    expect(Status.APPROVED.value).toBe("approved");
    expect(Status.REJECTED.value).toBe("rejected");
    
    // Check indices
    expect(Status.PENDING.index).toBe(0);
    expect(Status.APPROVED.index).toBe(1);
    expect(Status.REJECTED.index).toBe(2);
    
    // Check lookup methods
    expect(Status.fromValue("pending")).toBe(Status.PENDING);
    expect(Status.fromIndex(1)).toBe(Status.APPROVED);
    
    // Check utility methods
    expect(Status.keys()).toEqual(["PENDING", "APPROVED", "REJECTED"]);
    expect(Status.values()).toEqual(["pending", "approved", "rejected"]);
    expect(Status.indexes()).toEqual([0, 1, 2]);
  });

  it("should handle empty array", () => {
    const EmptyEnum = CreateSafeEnumFromArray([] as const);
    expect(EmptyEnum.keys()).toEqual([]);
    expect(EmptyEnum.values()).toEqual([]);
    expect(EmptyEnum.indexes()).toEqual([]);
  });

  it("should handle single value array", () => {
    const SingleEnum = CreateSafeEnumFromArray(["only"] as const);
    expect(SingleEnum.ONLY).toBeDefined();
    expect(SingleEnum.ONLY.value).toBe("only");
    expect(SingleEnum.ONLY.index).toBe(0);
    expect(SingleEnum.fromValue("only")).toBe(SingleEnum.ONLY);
  });
});
