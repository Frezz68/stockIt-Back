import { Request, Response } from "express";
import AppDataSource from "../config/database";
import { Product } from "../entity/Product";

export class ProductController {
  static async createProduct(req: Request, res: Response) {
    const { name, EAN, reference, description } = req.body as Product;
    if (!name) {
      return res.status(400).json({ message: "Product name is required" });
    }

    try {
      const productRepository = AppDataSource.getRepository(Product);
      const newProduct = productRepository.create({
        name,
        EAN,
        reference,
        description,
      });
      await productRepository.save(newProduct);
      return res.status(201).json(newProduct);
    } catch (error) {
      console.error("Error creating product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getAllProducts(req: Request, res: Response) {
    try {
      const productRepository = AppDataSource.getRepository(Product);
      const products = await productRepository.find();
      return res.status(200).json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getProductById(req: Request, res: Response) {
    const id = req.query.id;
    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }
    try {
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOneBy({ id: Number(id) });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getProductByEAN(req: Request, res: Response) {
    const { ean } = req.query;
    if (!ean) {
      return res.status(400).json({ message: "EAN parameter is required" });
    }
    try {
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOneBy({ EAN: ean as string });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product by EAN:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async getProductByReference(req: Request, res: Response) {
    const reference = req.query.reference;
    if (!reference) {
      return res.status(400).json({ message: "Product reference is required" });
    }
    try {
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOneBy({
        reference: reference as string,
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }
      return res.status(200).json(product);
    } catch (error) {
      console.error("Error fetching product by reference:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async updateProduct(req: Request, res: Response) {
    const { id } = req.params;
    const { name, EAN, reference, description } = req.body as Product;

    try {
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOneBy({ id: Number(id) });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      product.name = name;
      product.EAN = EAN;
      product.reference = reference;
      product.description = description;

      await productRepository.save(product);
      return res.status(200).json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }

  static async deleteProduct(req: Request, res: Response) {
    const { id } = req.params;

    try {
      const productRepository = AppDataSource.getRepository(Product);
      const product = await productRepository.findOneBy({ id: Number(id) });

      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      await productRepository.remove(product);
      return res.status(204).send();
    } catch (error) {
      console.error("Error deleting product:", error);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}
