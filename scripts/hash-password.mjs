import { randomBytes, scryptSync } from "node:crypto";

const password = process.argv[2];
if (!password) {
  console.error('Usage: pnpm auth:hash -- "your password"');
  process.exit(1);
}
const salt = randomBytes(16).toString("base64url");
const digest = scryptSync(password, salt, 64).toString("base64url");
// Colons avoid `$` expansion when the value is pasted into a local .env file.
process.stdout.write(`scrypt:${salt}:${digest}\n`);
