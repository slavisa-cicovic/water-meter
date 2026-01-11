import { randomBytes, scrypt as scryptCallback, timingSafeEqual } from 'crypto';
import { promisify } from 'util';

const scrypt = promisify(scryptCallback);

const PREFIX = 'scrypt';
const SALT_BYTES = 16;
const KEY_LENGTH = 64;

const encode = (value: Buffer) => value.toString('hex');

const decode = (value: string) => Buffer.from(value, 'hex');

export const PasswordService = {
  async hashPassword(password: string) {
    const salt = randomBytes(SALT_BYTES).toString('hex');
    const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    return `${PREFIX}$${salt}$${encode(derived)}`;
  },

  async verifyPassword(password: string, stored: string) {
    if (!stored) return false;
    const [prefix, salt, hash] = stored.split('$');
    if (prefix !== PREFIX || !salt || !hash) {
      return stored === password;
    }

    const derived = (await scrypt(password, salt, KEY_LENGTH)) as Buffer;
    const expected = decode(hash);
    if (expected.length !== derived.length) {
      return false;
    }
    return timingSafeEqual(expected, derived);
  },

  needsUpgrade(stored: string) {
    return !stored.startsWith(`${PREFIX}$`);
  },
};
