import { StockMovement, MovementType } from "../entity/StockMovement";
import { AuthRequest } from "../middleware/auth.middleware";
import { Response } from "express";
import AppDataSource from "../config/database";

export class StockMovementController {
  public static async createStockMovement(
    productId: number,
    companyId: number,
    userId: number,
    quantity: number,
    type: MovementType
  ) {
    try {
      const stockMovementRepository =
        AppDataSource.getRepository(StockMovement);
      const movement = stockMovementRepository.create({
        productId,
        companyId,
        userId,
        quantity,
        type,
        date: new Date(),
      });
      await stockMovementRepository.save(movement);
    } catch (error) {
      console.error("Error creating stock movement:", error);
    }
  }

  public static async getAllStockMovements(req: AuthRequest, res: Response) {
    const companyId = req.user!.company.id;

    try {
      const stockMovementRepository =
        AppDataSource.getRepository(StockMovement);
      const movements = await stockMovementRepository.find({
        where: { companyId },
        relations: ["product", "user"],
        select: {
          id: true,
          productId: true,
          companyId: true,
          userId: true,
          quantity: true,
          date: true,
          type: true,
          product: {
            id: true,
            name: true,
            EAN: true,
            reference: true,
          },
          user: {
            id: true,
            firstname: true,
            lastname: true,
          },
        },
        order: { date: "DESC" },
      });
      res.status(200).json(movements);
    } catch (error) {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}
