import { Router } from "express";
import { PdfController } from "../controllers/pdf.controller";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";

const router = Router();

router.get(
  "/qr-codes",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    PdfController.generateQRCodesPDF(req, res);
  }
);

router.get(
  "/qr-codes/:productId",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    PdfController.generateSingleQRCodePDF(req, res);
  }
);

export default router;
