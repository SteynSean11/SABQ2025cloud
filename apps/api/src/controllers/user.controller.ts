import { Request, Response } from 'express';
import { RegisterUserInput, LoginUserInput } from '@sabq/validation';
import { UserService } from '../services/user.service';

export class UserController {
  /**
   * Handles user registration.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  static async register(req: Request, res: Response) {
    try {
      const userData: RegisterUserInput = req.body;
      const newUser = await UserService.registerUser(userData);
      res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('email')) {
        return res.status(409).json({ message: 'Email already registered' });
      }
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }

  /**
   * Handles user login.
   * @param req - Express request object.
   * @param res - Express response object.
   */
  static async login(req: Request, res: Response) {
    try {
      const credentials: LoginUserInput = req.body;
      const result = await UserService.loginUser(credentials);
 
       if (!result) {
         return res.status(401).json({ message: 'Invalid credentials' });
       }
 
       const { user, token } = result;
       res.status(200).json({ message: 'Login successful', user, token });
    } catch (error: any) {
      res.status(500).json({ message: 'Internal server error', error: error.message });
    }
  }
}