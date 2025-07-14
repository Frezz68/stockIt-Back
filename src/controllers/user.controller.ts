import { Request, Response } from "express";
import AppDataSource from "../config/database";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export class UserController {
  static async register(req: Request, res: Response) {
    try {
      const { firstname, lastname, email, password } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = userRepository.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        lastConnection: new Date().toISOString(),
      });

      await userRepository.save(user);

      const { password: _, lastConnection: __, ...userInfo } = user;
      return res.status(201).json(userInfo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de l'inscription" });
    }
  }

  static async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      const userRepository = AppDataSource.getRepository(User);
      const user = await userRepository.findOne({ where: { email } });

      if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "votre_secret_tres_securise",
        { expiresIn: "24h" }
      );

      const { password: _, lastConnection: __, ...userInfo } = user;
      return res.json({
        ...userInfo,
        token
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  }
}