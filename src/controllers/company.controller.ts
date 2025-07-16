import { Request, Response } from "express";
import AppDataSource from "../config/database";
import { Company } from "../entity/Company";

export class CompanyController {
    static async getCompanyInfoById(req: Request, res: Response) {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: "Company not found" });
        }
        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const company = await companyRepository.findOneBy({ id: Number(id) });
            if (company) {
                res.json(company);
            } else {
                res.status(404).json({ message: "Company not found" });
            }
        } catch (error) {
            console.error("Error fetching company info:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    } 

    static async updateCompany(req: Request, res: Response) {
        const { id } = req.params;
        const { name } = req.body;
        if (!id) {
            return res.status(400).json({ message: "Company not found" });
        }
        if (!name) {
            return res.status(400).json({ message: "Company name is required" });
        }

        try {
            const companyRepository = AppDataSource.getRepository(Company);
            const company = await companyRepository.findOneBy({ id: Number(id) });
            if (!company) {
                return res.status(404).json({ message: "Company not found" });
            }

            company.name = name || company.name;

            await companyRepository.save(company);
            res.json(company);
        } catch (error) {
            console.error("Error updating company:", error);
            res.status(500).json({ message: "Internal server error" });
        }
    }
}