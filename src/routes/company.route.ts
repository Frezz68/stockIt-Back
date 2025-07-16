import { Router, Request, Response } from "express";
import { authenticateToken, authorizeManager } from "../middleware/auth.middleware";
import { CompanyController } from "../controllers/company.controller";

const router = Router();


router.get("/:id",authenticateToken, authorizeManager, (req: Request, res: Response) => {
    CompanyController.getCompanyInfoById(req, res);
});

router.put("/:id", authenticateToken, authorizeManager, (req: Request, res: Response) => {
    CompanyController.updateCompany(req, res);
});

export default router;