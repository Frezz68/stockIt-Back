import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany } from "typeorm";
import { User } from "./User";

export enum RoleType {
  GERANT = "gérant",
  EMPLOYE = "employé",
}

@Entity("role")
export class Role {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({
    type: "enum",
    enum: RoleType,
  })
  name!: RoleType;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}
