import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  UserController.register(req, res);
});
router.post("/login", (req: Request, res: Response) => {
  UserController.login(req, res);
});

export default router;