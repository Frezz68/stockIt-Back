import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entity/User";
import AppDataSource from "../config/database";
import { RoleType } from "../entity/Role";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    res.status(401).json({ message: "Token d'authentification requis" });
    return;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "votre_secret_tres_securise") as { userId: number };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ relations: { role: true }, where: { id: decoded.userId } });

    if (!user) {
      res.status(403).json({ message: "Utilisateur non trouvé" });
      return;
    }
    console.log("Utilisateur authentifié :", user);
    (req as AuthRequest).user = user;
    next();
  } catch (error) {
    res.status(403).json({ message: "Token invalide" });
  }
};

export const authorizeManager = (req: Request, res: Response, next: NextFunction): void => {
  const user = (req as AuthRequest).user;
  if (!user || user.role.name !== RoleType.GERANT) {
    res.status(403).json({ message: "Accès refusé : vous devez être gérant" });
    return;
  }
  next();
};