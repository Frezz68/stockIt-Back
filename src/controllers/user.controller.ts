import { Request, Response } from "express";
import AppDataSource from "../config/database";
import { User } from "../entity/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { AuthRequest } from "../middleware/auth.middleware";
import { Company } from "../entity/Company";

export class UserController {

  static async register(req: Request, res: Response) {
    try {
      const { firstname, lastname, email, password, companyName } = req.body;

      if (!firstname || !lastname || !email || !password || !companyName) {
        return res.status(400).json({ message: "Tous les champs sont requis" });
      }
      if (password.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }
      
      const userRepository = AppDataSource.getRepository(User);
      const existingUser = await userRepository.findOne({ where: { email } });

      if (existingUser) {
        return res.status(400).json({ message: "Cet email est déjà utilisé" });
      }

      const companyRepository = AppDataSource.getRepository(Company);
      const company = companyRepository.create({ name: companyName });
      await companyRepository.save(company);

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = userRepository.create({
        firstname,
        lastname,
        email,
        password: hashedPassword,
        lastConnection: new Date().toISOString(),
        role: { id: 1 },
        company: company
      });

      await userRepository.save(user);

      const { password: _, lastConnection: __, role: ___, ...userInfo } = user;
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

      const { password: _, role: __, ...userInfo } = user;

      user.lastConnection = new Date();
      await userRepository.save(user);

      return res.json({
        ...userInfo,
        token
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  }

  static async passwordReset(req: AuthRequest, res: Response) {
    try {

      const { newPassword } = req.body;
      if (!newPassword) {
        return res.status(400).json({ message: "Nouveau mot de passe requis" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ message: "Le mot de passe doit contenir au moins 6 caractères" });
      }

      const user = req.user;

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await AppDataSource.getRepository(User).save(user);

      return res.status(200).json({ message: "Mot de passe réinitialisé avec succès" });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la réinitialisation du mot de passe" });
    }
  }

  static async addEmployeeAccount(req: AuthRequest, res: Response) {
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
        role: { id: 2 },
        company: (req as AuthRequest).user?.company // Assuming the user is authenticated and has a company
      });

      await userRepository.save(user);

      const { password: _, lastConnection: __, role: ___, ...userInfo } = user;
      return res.status(201).json(userInfo);
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la création du compte employé" });
    }
  }
}