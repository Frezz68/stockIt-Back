import { Request, Response } from "express";
import AppDataSource from "../config/database";
import { User } from "../entity/User";
import { Role, RoleType } from "../entity/Role";
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
        return res.status(400).json({
          message: "Le mot de passe doit contenir au moins 6 caractères",
        });
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
        company: company,
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
      const user = await userRepository.findOne({
        where: { email },
        relations: ["role"],
      });

      if (!user) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const isPasswordValid = await bcrypt.compare(password, user.password);

      if (!isPasswordValid) {
        return res
          .status(401)
          .json({ message: "Email ou mot de passe incorrect" });
      }

      const token = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET || "votre_secret_tres_securise",
        { expiresIn: "24h" }
      );

      const { password: _, ...userInfo } = user;

      user.lastConnection = new Date();
      await userRepository.save(user);

      return res.json({
        ...userInfo,
        token,
      });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ message: "Erreur lors de la connexion" });
    }
  }

  static async passwordReset(req: AuthRequest, res: Response) {
    try {
      const { newPassword, currentPassword } = req.body;

      if (!newPassword) {
        return res.status(400).json({ message: "Nouveau mot de passe requis" });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({
          message: "Le mot de passe doit contenir au moins 6 caractères",
        });
      }

      const user = req.user;

      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }

      if (currentPassword) {
        const isCurrentPasswordValid = await bcrypt.compare(
          currentPassword,
          user.password
        );
        if (!isCurrentPasswordValid) {
          return res
            .status(400)
            .json({ message: "Mot de passe actuel incorrect" });
        }
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      user.password = hashedPassword;
      await AppDataSource.getRepository(User).save(user);

      const message = currentPassword
        ? "Mot de passe modifié avec succès"
        : "Mot de passe réinitialisé avec succès";

      return res.status(200).json({ message });
    } catch (error) {
      console.error(error);
      return res.status(500).json({
        message: "Erreur lors de la réinitialisation du mot de passe",
      });
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
        company: (req as AuthRequest).user?.company,
      });

      await userRepository.save(user);

      const { password: _, lastConnection: __, role: ___, ...userInfo } = user;
      return res.status(201).json(userInfo);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erreur lors de la création du compte employé" });
    }
  }

  static async getEmployees(req: AuthRequest, res: Response) {
    try {
      const userRepository = AppDataSource.getRepository(User);
      const companyId = (req as AuthRequest).user?.company?.id;

      if (!companyId) {
        return res.status(400).json({ message: "Entreprise non trouvée" });
      }

      const employees = await userRepository.find({
        where: {
          company: { id: companyId },
          role: { name: RoleType.EMPLOYE },
        },
        relations: ["role", "company"],
        select: ["id", "firstname", "lastname", "email", "lastConnection"],
      });

      return res.json(employees);
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erreur lors du chargement des employés" });
    }
  }

  static async deleteEmployee(req: AuthRequest, res: Response) {
    try {
      const { id } = req.params;
      const userRepository = AppDataSource.getRepository(User);
      const companyId = (req as AuthRequest).user?.company?.id;

      if (!companyId) {
        return res.status(400).json({ message: "Entreprise non trouvée" });
      }

      const employee = await userRepository.findOne({
        where: {
          id: parseInt(id),
          company: { id: companyId },
          role: { name: RoleType.EMPLOYE },
        },
        relations: ["role", "company"],
      });

      if (!employee) {
        return res.status(404).json({ message: "Employé non trouvé" });
      }

      await userRepository.remove(employee);
      return res.json({ message: "Employé supprimé avec succès" });
    } catch (error) {
      console.error(error);
      return res
        .status(500)
        .json({ message: "Erreur lors de la suppression de l'employé" });
    }
  }
}
