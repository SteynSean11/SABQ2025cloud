import bcrypt from 'bcrypt';
import { RegisterUserInput, LoginUserInput } from '@sabq/validation';
import { PrismaClient } from '@prisma/client';
import { AuthService } from './auth.service';

export class UserService {
  constructor(private prisma: PrismaClient) {}

  /**
   * Registers a new user.
   * @param data - User registration input (email, password, name).
   * @returns The newly created user (excluding password).
   */
  async registerUser(data: RegisterUserInput) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: data.email,
        password: hashedPassword,
        name: data.name,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        updatedAt: true,
      },
    });
    return user;
  }

  /**
   * Authenticates a user.
   * @param data - User login input (email, password).
   * @returns The authenticated user and a JWT, or null if authentication fails.
   */
  async loginUser(data: LoginUserInput) {
    const user = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!user) {
      return null;
    }

    const isPasswordValid = await bcrypt.compare(data.password, user.password);

    if (!isPasswordValid) {
      return null;
    }

    const token = AuthService.generateToken(user);

    // Exclude password from the returned user object
    const { password, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  }
}