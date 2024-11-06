import express, {Request, Response} from "express";
import { PrismaClient,Todo, TodoStatus } from "@prisma/client";
import z from "zod";
import { title } from "process";
const router = express.Router();

const prisma = new PrismaClient();

interface TodoResponse {
      success: boolean;
      message: string;
      data?:Todo | Todo[] | null
}

const todoschema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate:z.string().datetime().optional()
})

router.get("/", async (req: Request, res: Response<TodoResponse>) : Promise<any> => {
      const Validate = todoschema.safeParse(req.body);
      // const userId = req.user?.id;

      if(!Validate.success){
          return res.status(401).json({
            success: false,
            message: "validation error"
          })
      }

      

      // const todo = await prisma.todo.create({
      //   data:{
      //       ...Validate
      //   },
      //   user: {
      //         userId
      //   }
      // })
  })



export default router