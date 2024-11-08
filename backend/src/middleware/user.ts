import { Response, Request, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { JWT_SECRET } from '../config';

export const userMiddleware = async ( req: any, res: Request, next: NextFunction ) => {

    const token = req.cookies.authorization;

    if(!token){
        return {
            status: false,
            message: 'Not authorized'
        }
    }

    const userVerify = jwt.verify(token.name, JWT_SECRET) as JwtPayload ;

    if(!userVerify){
        return {
            status: false,
            message: 'Invalid token'
        }
    }

    next();

}