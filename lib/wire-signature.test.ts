import { createHmac } from "node:crypto";
import { describe, expect, it } from "vitest";
import { verifyWireSignature } from "./wire-signature";

describe("verifyWireSignature", () => {
  const secret = "whsec_test_secret";
  const body = '{"id":"evt_test","type":"payment_intent.succeeded"}';
  const timestamp = "1791774042";
  const signature = createHmac("sha256", secret).update(timestamp + "." + body).digest("hex");

  it("accepts a valid timestamped HMAC signature", () => {
    expect(verifyWireSignature(body, `t=${timestamp},v1=${signature}`, secret, Number(timestamp))).toBe(true);
  });

  it("rejects a changed body", () => {
    expect(verifyWireSignature(body + " ", `t=${timestamp},v1=${signature}`, secret, Number(timestamp))).toBe(false);
  });

  it("rejects stale signatures", () => {
    expect(verifyWireSignature(body, `t=${timestamp},v1=${signature}`, secret, Number(timestamp) + 301)).toBe(false);
  });
});
