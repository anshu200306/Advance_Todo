import express, { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = express.Router();
const prisma = new PrismaClient();

const signupSchema = z.object({
  username: z.string().min(3).max(50),
  email: z.string().email(),
  password: z.string().min(4),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
});

type FinalSignupSchema = z.infer<typeof signupSchema>;

router.post("/signup", async (req: Request, res: Response) => {
  try {
    const validatedData: FinalSignupSchema = signupSchema.parse(req.body);

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

    const newUser = await prisma.user.create({
      data: {
        username: validatedData.username,
        email: validatedData.email,
        password: validatedData.password,
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

export default router;
