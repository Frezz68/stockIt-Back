import { Router, Request, Response } from "express";
import { authenticateToken } from "../middleware/auth.middleware";
import { ProductController } from "../controllers/product.controller";

const router = Router();

router.post("/", authenticateToken, (req: Request, res: Response) => {
  ProductController.createProduct(req, res);
});
router.get("/", (req: Request, res: Response) => {
  ProductController.getAllProducts(req, res);
});
router.get("/search", (req: Request, res: Response) => {
  if (req.query.ean) {
    ProductController.getProductByEAN(req, res);
  } else if (req.query.id) {
    ProductController.getProductById(req, res);
  } else if (req.query.reference) {
    ProductController.getProductByReference(req, res);
  } else {
    res.status(400).json({
      error: "Missing search parameter (ean, id, or reference required)",
    });
  }
});
router.put("/:id", authenticateToken, (req: Request, res: Response) => {
  ProductController.updateProduct(req, res);
});
router.delete("/:id", authenticateToken, (req: Request, res: Response) => {
  ProductController.deleteProduct(req, res);
});

export default router;
