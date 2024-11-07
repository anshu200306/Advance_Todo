import express, {Request, Response} from "express";
import { PrismaClient,Todo } from "@prisma/client";
import z from "zod";

const router = express.Router();

const prisma = new PrismaClient();

interface TodoResponse {
      success: boolean;
      message: string;
      data?:Todo | Todo[] | null
}

const todoSchema = z.object({
  userId: z.number(),
  title: z.string().min(1),
  description: z.string().optional(),
  status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).optional(),
  priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'URGENT']).optional(),
  dueDate:z.string().datetime().optional()
})

type validateSchema = z.infer<typeof todoSchema>

router.get("/newtodo", async (req: Request, res: Response<TodoResponse>) : Promise<any> => {
      
  try{
    const validate : validateSchema = todoSchema.parse(req.body);

      if(!validate){
          return res.status(401).json({
            success: false,
            message: "validation error",
            data: null
          })
      }

      const todo = await prisma.todo.create({
        data: {
          title: validate.title,
          description: validate.description || "",
          status: validate.status,
          priority: validate.priority,
          userId: validate.userId
        }
      })

      return res.status(200).json({
        success: true,
        message: 'Todo created',
        data: todo
      })

  }catch(error){
    console.log('Error: ' + error);
    return res.status(500).json({
      success: false,
      message: 'Internal Server Error',
      data: null
    })
  }
  
  })



export default router