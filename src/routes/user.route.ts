import { Router, Request, Response } from "express";
import { UserController } from "../controllers/user.controller";
import { authenticateToken, authorizeManager, AuthRequest } from "../middleware/auth.middleware";

const router = Router();

router.post("/register", (req: Request, res: Response) => {
  UserController.register(req, res);
});
router.post("/login", (req: Request, res: Response) => {
  UserController.login(req, res);
});
router.post("/add-employee", authenticateToken, authorizeManager, (req: Request, res: Response) => {
  UserController.addEmployeeAccount(req, res);
});
router.post("/password-reset", authenticateToken, (req: AuthRequest, res: Response) => {
  UserController.passwordReset(req, res);
});

export default router;