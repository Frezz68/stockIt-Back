import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { User } from "./User";
import { ProductCompany } from "./ProductCompany";

@Entity("company")
export class Company {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  name!: string;

  @OneToMany(() => User, (user) => user.company)
  users!: User[];

  @OneToMany(() => ProductCompany, (productCompany) => productCompany.company)
  productCompanies!: ProductCompany[];
}
