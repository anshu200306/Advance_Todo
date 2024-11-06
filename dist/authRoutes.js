"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const config_1 = require("./config");
const bcrypt_1 = __importDefault(require("bcrypt"));
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
const signUpSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    email: zod_1.z.string().email(),
    password: zod_1.z.string().min(4),
    firstName: zod_1.z.string().min(1),
    lastName: zod_1.z.string().min(1),
});
router.post("/signup", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = signUpSchema.parse(req.body);
        const existingUser = yield prisma.user.findFirst({
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
        const hashPass = yield bcrypt_1.default.hash(validatedData.password, 10);
        const newUser = yield prisma.user.create({
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
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}));
const signInSchema = zod_1.z.object({
    username: zod_1.z.string().min(3).max(50),
    password: zod_1.z.string().min(4)
});
router.post('/signin', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const validatedData = signInSchema.parse(req.body);
        const userExist = yield prisma.user.findUnique({
            where: {
                username: validatedData.username
            }
        });
        if (!userExist) {
            return res.status(400).json({
                success: false,
                message: 'User not found'
            });
        }
        const pass = yield bcrypt_1.default.compare(validatedData.password, userExist.password);
        if (!pass) {
            return res.status(400).json({
                success: false,
                message: 'Incorrect password'
            });
        }
        const token = jsonwebtoken_1.default.sign(userExist.username, config_1.JWT_SECRET);
        res.cookie('authorization', token);
        return res.status(201).json({
            success: true,
            message: "User created successfully",
            data: userExist
        });
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Internal server error"
        });
    }
}));
exports.default = router;
