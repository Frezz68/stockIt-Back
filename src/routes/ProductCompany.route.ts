import { Router, Request, Response } from "express";
import { ProductCompanyController } from "../controllers/productCompany.controller";
import { authenticateToken, AuthRequest } from "../middleware/auth.middleware";

const router = Router();
router.get("/", authenticateToken, (req: AuthRequest, res: Response) => {
  ProductCompanyController.getAllProductCompanies(req, res);
});
router.get("/:id", authenticateToken, (req: AuthRequest, res: Response) => {
  ProductCompanyController.getProductCompanyById(req, res);
});
router.post("/", authenticateToken, (req: AuthRequest, res: Response) => {
  ProductCompanyController.createProductCompany(req, res);
});
router.put(
  "/:productId",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    ProductCompanyController.updateProductCompany(req, res);
  }
);
router.patch(
  "/:productId/amount",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    ProductCompanyController.updateAmount(req, res);
  }
);
router.delete(
  "/:productId",
  authenticateToken,
  (req: AuthRequest, res: Response) => {
    ProductCompanyController.deleteProductCompany(req, res);
  }
);
export default router;
