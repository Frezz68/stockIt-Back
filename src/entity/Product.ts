import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import { ProductCompany } from "./ProductCompany";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  EAN?: string;

  @Column({ nullable: true })
  reference?: string;

  @Column({ nullable: true })
  image?: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

  @OneToMany(() => ProductCompany, (productCompany) => productCompany.product)
  productCompanies!: ProductCompany[];
}
