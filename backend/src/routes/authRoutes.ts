import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';
import jwt  from 'jsonwebtoken'
import { JWT_SECRET } from '../config';
import bcrypt from 'bcrypt';

const router = express.Router();
const prisma = new PrismaClient();

const signUpSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(4),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

type FinalSignupSchema = z.infer<typeof signUpSchema>;

router.post("/signup", async (req: Request, res: Response) : Promise<any> => {
  try {
    const validatedData: FinalSignupSchema = signUpSchema.parse(req.body);

    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: validatedData.email },
          { username: validatedData.username }
        ]
      }
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: existingUser.email === validatedData.email
          ? "Email already registered"
          : "Username already taken",
      });
    }

    const hashPass = await bcrypt.hash(validatedData.password, 10);

    const newUser = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: hashPass,
        firstName: validatedData.firstName,
        lastName: validatedData.lastName
      },
      select: {
        id: true,
        username: true,
        email: true,
        firstName: true,
        lastName: true,
      }
    });

    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: newUser
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });
  }
});

const signInSchema = z.object({
  username: z.string().min(3).max(50),
  password: z.string().min(4)
});

type FinalSignInSchema = z.infer<typeof signInSchema>;

router.post('/signin', async ( req: Request, res: Response ) : Promise<any> => {

  try{

    const validatedData : FinalSignInSchema = signInSchema.parse(req.body);

    const userExist = await prisma.user.findUnique({
      where: {
        username: validatedData.username
      }
    })

    if(!userExist){
      return res.status(400).json({
        success: false,
        message: 'User not found'
      });
    }

    const pass = await bcrypt.compare(validatedData.password, userExist.password)

    if(!pass){
      return res.status(400).json({
        success: false,
        message: 'Incorrect password'
      });
    }

    const token = jwt.sign(userExist.username, JWT_SECRET);
    res.cookie('authorization', token);


    return res.status(201).json({
      success: true,
      message: "User created successfully",
      data: userExist
    });

  }catch(error){

    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Internal server error"
    });

  }

})

export default router;