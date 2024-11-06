import { Response, Request, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export const userMiddleware = async ( req: Response, res: Request, next: NextFunction ) => {

    const token = req.cookie;

    if(!token){
        return {
            status: false,
            message: 'Not authorized'
        }
    }

    const userVerify = jwt.verify(token.name, JWT_SECRET);

    if(!userVerify){
        return {
            status: false,
            message: 'Invalid token'
        }
    }

    next();

}