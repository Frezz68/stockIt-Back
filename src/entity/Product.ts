import { Entity, PrimaryGeneratedColumn, Column } from "typeorm";

@Entity()
export class Product {
  @PrimaryGeneratedColumn()
  id!: number;

  @Column({ nullable: true })
  EAN?: string;

  @Column()
  reference!: string;

  @Column({ nullable: true })
  image?: string;

  @Column()
  name!: string;

  @Column({ type: "text", nullable: true })
  description?: string;

}
