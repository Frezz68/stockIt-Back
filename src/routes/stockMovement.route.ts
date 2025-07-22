import { Router, Request, Response } from "express";
import { StockMovementController } from "../controllers/StockMovement.controller";
import {
  authenticateToken,
  authorizeManager,
  AuthRequest,
} from "../middleware/auth.middleware";

const router = Router();

router.get(
  "/",
  authenticateToken,
  authorizeManager,
  (req: AuthRequest, res: Response) => {
    StockMovementController.getAllStockMovements(req, res);
  }
);

export default router;
