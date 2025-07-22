import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import { ProductCompany } from "../entity/ProductCompany";
import AppDataSource from "../config/database";

export class ProductCompanyController {
  static async getAllProductCompanies(req: AuthRequest, res: Response) {
    const companyId = req.user!.company.id;

    try {
      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const productCompanies = await productCompanyRepository.find({
        where: { companyId },
        relations: ["product"],
      });
      res.status(200).json(productCompanies);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async getProductCompanyById(req: AuthRequest, res: Response) {
    const { id } = req.params;
    const companyId = req.user!.company.id;

    try {
      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const productCompany = await productCompanyRepository.findOne({
        where: {
          productId: parseInt(id),
          companyId,
        },
        relations: ["product"],
      });
      if (!productCompany) {
        return res.status(404).json({ error: "Product company not found" });
      }
      res.json(productCompany);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async createProductCompany(req: AuthRequest, res: Response) {
    const { productId, amount } = req.body;
    const companyId = req.user!.company.id;
    try {
      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const newProductCompany = productCompanyRepository.create({
        companyId,
        productId,
        amount,
      });
      await productCompanyRepository.save(newProductCompany);
      res.status(201).json(newProductCompany);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateProductCompany(req: AuthRequest, res: Response) {
    const { productId } = req.params;
    const companyId = req.user!.company.id;
    const { amount, price, min_stock } = req.body;

    try {
      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const productCompany = await productCompanyRepository.findOne({
        where: {
          productId: parseInt(productId),
          companyId,
        },
        relations: ["product", "company"],
      });

      if (!productCompany) {
        return res.status(404).json({ error: "Product company not found" });
      }

      if (amount !== undefined && amount !== null && amount !== "") {
        productCompany.amount = Number(amount);
      }
      if (price !== undefined && price !== null && price !== "") {
        productCompany.price = Number(price);
      }
      if (min_stock !== undefined && min_stock !== null && min_stock !== "") {
        productCompany.min_stock = Number(min_stock);
      }

      await productCompanyRepository.save(productCompany);
      res.json(productCompany);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async updateAmount(req: AuthRequest, res: Response) {
    const { productId } = req.params;
    const companyId = req.user!.company.id;
    const { operation, value } = req.body; // operation: "increment" | "decrement" | "set", value: number

    try {
      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const productCompany = await productCompanyRepository.findOne({
        where: {
          productId: parseInt(productId),
          companyId,
        },
        relations: ["product", "company"],
      });

      if (!productCompany) {
        return res.status(404).json({ error: "Product company not found" });
      }

      if (
        !operation ||
        !["increment", "decrement", "set"].includes(operation)
      ) {
        return res.status(400).json({
          error:
            "Invalid operation. Must be 'increment', 'decrement', or 'set'",
        });
      }

      if (value === undefined || typeof value !== "number") {
        return res.status(400).json({
          error: "Value must be a number",
        });
      }

      switch (operation) {
        case "increment":
          productCompany.amount += value;
          break;
        case "decrement":
          productCompany.amount = Math.max(0, productCompany.amount - value);
          break;
        case "set":
          productCompany.amount = Math.max(0, value);
          break;
      }

      await productCompanyRepository.save(productCompany);
      res.json({
        message: `Amount ${operation}ed successfully`,
        productCompany,
      });
    } catch (error) {
      console.error("Error updating amount:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }

  static async deleteProductCompany(req: AuthRequest, res: Response) {
    const { productId } = req.params;
    const companyId = req.user!.company.id;

    try {
      const productCompanyRepository =
        AppDataSource.getRepository(ProductCompany);
      const productCompany = await productCompanyRepository.findOne({
        where: {
          productId: parseInt(productId),
          companyId,
        },
      });

      if (!productCompany) {
        return res.status(404).json({ error: "Product company not found" });
      }

      await productCompanyRepository.remove(productCompany);
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
