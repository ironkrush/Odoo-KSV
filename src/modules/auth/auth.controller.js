import * as authService from './auth.service.js';
import { loginSchema, registerSchema } from './auth.schema.js';

export const handleLogin = async (req, res, next) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await authService.login(data.email, data.password);
    return res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};

export const handleRegister = async (req, res, next) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await authService.register(data);
    return res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};
