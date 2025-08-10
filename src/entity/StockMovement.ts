import {
  Entity,
  Column,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from "typeorm";
import { Product } from "./Product";
import { Company } from "./Company";
import { User } from "./User";

export enum MovementType {
  IN = "IN",
  OUT = "OUT",
  ADJUSTMENT = "ADJUSTMENT",
  DELETE = "DELETE",
}

@Entity()
export class StockMovement {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  productId!: number;

  @ManyToOne(() => Product, (product) => product.productCompanies)
  @JoinColumn({ name: "productId" })
  product!: Product;

  @Column()
  companyId!: number;

  @ManyToOne(() => Company, (company) => company.productCompanies)
  @JoinColumn({ name: "companyId" })
  company!: Company;

  @Column()
  userId!: number;

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: "userId" })
  user!: User;

  @Column()
  quantity!: number;

  @Column()
  date!: Date;

  @Column({
    type: "varchar",
    length: 20,
  })
  type!: MovementType;
}
