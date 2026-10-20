import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { isObjectId } from './validateObjectId.js';
import HttpError from '../utils/HttpError.js';
import asyncHandler from '../utils/asyncHandler.js';

export const requireAuth = asyncHandler(async (req, res, next) => {
  const authorization = req.get('Authorization') || '';
  const [scheme, token] = authorization.split(' ');
  if (scheme !== 'Bearer' || !token) {
    throw new HttpError(401, 'Autenticación requerida');
  }

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET, { algorithms: ['HS256'] });
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError || error instanceof jwt.TokenExpiredError) {
      throw new HttpError(401, 'Token inválido o vencido');
    }
    throw error;
  }

  if (
    !payload ||
    typeof payload !== 'object' ||
    typeof payload.sub !== 'string' ||
    !isObjectId(payload.sub)
  ) {
    throw new HttpError(401, 'Token inválido o vencido');
  }
  const user = await User.findById(payload.sub);
  if (!user) throw new HttpError(401, 'Autenticación requerida');
  req.user = user;
  next();
});
