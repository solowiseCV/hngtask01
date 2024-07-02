import { Router } from "express";
import { userInfo } from '../controllers/user.controller.js';

const router = Router();

router.get("/api/hello", userInfo) 

export default router;