import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { User } from "../entity/User";
import AppDataSource from "../config/database";

export interface AuthRequest extends Request {
  user?: User;
}

export const authenticateToken = async (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(401).json({ message: "Token d'authentification requis" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "votre_secret_tres_securise") as { userId: number };
    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({ where: { id: decoded.userId } });

    if (!user) {
      return res.status(403).json({ message: "Utilisateur non trouvé" });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(403).json({ message: "Token invalide" });
  }
};