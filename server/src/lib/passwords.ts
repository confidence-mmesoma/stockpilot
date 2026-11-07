import bcrypt from 'bcryptjs';

// Higher = slower to crack, but also slower to log in. 12 is a common choice.
const SALT_ROUNDS = 12;

export const hashPassword = (plain: string) => bcrypt.hash(plain, SALT_ROUNDS);

export const verifyPassword = (plain: string, hash: string) => bcrypt.compare(plain, hash);