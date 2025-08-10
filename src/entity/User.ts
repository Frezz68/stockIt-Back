import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  ManyToOne,
} from "typeorm";
import { Role } from "./Role";
import { Company } from "./Company";

@Entity("user")
export class User {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column()
  firstname!: string;

  @Column()
  lastname!: string;

  @Column({ unique: true })
  email!: string;

  @Column()
  password!: string;

  @CreateDateColumn({ name: "last_connection", nullable: true })
  lastConnection?: Date;

  @ManyToOne(() => Role, (role) => role.users)
  role!: Role;

  @ManyToOne(() => Company, (company) => company.users)
  company!: Company;
}
