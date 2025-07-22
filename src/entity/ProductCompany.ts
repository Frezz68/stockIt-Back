import { Entity, Column, PrimaryColumn, ManyToOne, JoinColumn } from "typeorm";
import { Product } from "./Product";
import { Company } from "./Company";

@Entity()
export class ProductCompany {
  @PrimaryColumn()
  productId!: number;

  @PrimaryColumn()
  companyId!: number;

  @ManyToOne(() => Product, (product) => product.productCompanies)
  @JoinColumn({ name: "productId" })
  product!: Product;

  @ManyToOne(() => Company, (company) => company.productCompanies)
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column()
  amount!: number;

  @Column({ type: "decimal", precision: 10, scale: 2, nullable: true })
  price?: number;

  @Column({ default: 0 })
  min_stock!: number;
}
