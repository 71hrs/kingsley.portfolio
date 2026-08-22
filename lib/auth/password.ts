import "server-only";
import { createHash, scryptSync, timingSafeEqual } from "node:crypto";

function safeEqual(left: Buffer, right: Buffer): boolean {
  return left.length === right.length && timingSafeEqual(left, right);
}

export function verifyPortfolioPassword(candidate: string): boolean {
  const storedHash = process.env.PORTFOLIO_PASSWORD_HASH;
  if (storedHash) {
    // Accept the current env-safe format and the earlier `$` format for
    // deployments that already stored a hash directly in Vercel.
    const separator = storedHash.includes(":") ? ":" : "$";
    const [algorithm, salt, expected] = storedHash.split(separator);
    if (algorithm !== "scrypt" || !salt || !expected) return false;
    const actual = scryptSync(candidate, salt, 64);
    return safeEqual(actual, Buffer.from(expected, "base64url"));
  }

  // Plain environment-variable support is kept for simple deployments. The
  // value still never enters HTML or a browser bundle; a hash is preferred.
  const password = process.env.PORTFOLIO_PASSWORD;
  if (!password) return false;
  const actual = createHash("sha256").update(candidate).digest();
  const expected = createHash("sha256").update(password).digest();
  return safeEqual(actual, expected);
}
