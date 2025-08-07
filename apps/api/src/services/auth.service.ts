import jwt from 'jsonwebtoken';
import { User } from '@prisma/client';

export class AuthService {
  /**
   * Generates a JWT for a user.
   * @param user - The user to generate the token for.
   * @returns A JWT.
   */
  static generateToken(user: User): string {
    const payload = { id: user.id, email: user.email };
    const token = jwt.sign(payload, process.env.JWT_SECRET!, {
      expiresIn: '1d',
    });
    return token;
  }
}
