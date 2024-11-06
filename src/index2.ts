import express from "express";
import userRoutes from "./userRoutes"
import authRoutes from "./authRoutes"
import cookieparser from 'cookie-parser';

const router  = express.Router();

router.use(cookieparser());

router.use('/users', userRoutes);
router.use('/auth', authRoutes);

export default router;