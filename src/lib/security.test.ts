import { describe, expect, it } from "vitest";
import { getSafeExternalUrl, getSafeMapboxPublicToken } from "@/src/lib/security";

describe("getSafeExternalUrl", () => {
  it("accepts https URLs while stripping credentials, query params, hashes, and edit suffixes", () => {
    expect(
      getSafeExternalUrl(
        "https://user:secret@partiful.com/events/demo/edit?invite=yes#details",
      ),
    ).toBe("https://partiful.com/events/demo");
  });

  it("rejects unsafe or malformed URLs", () => {
    expect(getSafeExternalUrl("http://example.com/event")).toBeNull();
    expect(getSafeExternalUrl("javascript:alert(1)")).toBeNull();
    expect(getSafeExternalUrl("not-a-url")).toBeNull();
  });
});

describe("getSafeMapboxPublicToken", () => {
  it("returns trimmed public tokens", () => {
    expect(getSafeMapboxPublicToken("  pk.demo-token_123  ")).toBe("pk.demo-token_123");
  });

  it("rejects missing, secret, or malformed tokens", () => {
    expect(getSafeMapboxPublicToken(undefined)).toBeNull();
    expect(getSafeMapboxPublicToken("sk.secret-token")).toBeNull();
    expect(getSafeMapboxPublicToken("pk token with spaces")).toBeNull();
  });
});
