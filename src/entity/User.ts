import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from "typeorm";

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

  @CreateDateColumn({ name: 'last_connection' })
  lastConnection!: Date;

}