import { createHmac, timingSafeEqual } from "node:crypto";

export function verifyWireSignature(
  rawBody: string,
  header: string,
  secret: string,
  nowSeconds = Math.floor(Date.now() / 1000),
  toleranceSeconds = 300,
): boolean {
  if (!secret || !header) return false;
  const fields = Object.fromEntries(header.split(",").map((part) => {
    const index = part.indexOf("=");
    return index < 0 ? [part.trim(), ""] : [part.slice(0, index).trim(), part.slice(index + 1).trim()];
  }));
  const timestamp = Number(fields.t);
  const supplied = fields.v1 || "";
  if (!Number.isInteger(timestamp) || Math.abs(nowSeconds - timestamp) > toleranceSeconds || !/^[a-f0-9]{64}$/i.test(supplied)) {
    return false;
  }
  const expected = createHmac("sha256", secret).update(`${timestamp}.${rawBody}`).digest();
  const actual = Buffer.from(supplied, "hex");
  return actual.length === expected.length && timingSafeEqual(actual, expected);
}
