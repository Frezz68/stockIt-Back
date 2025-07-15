import { MigrationInterface, QueryRunner } from "typeorm";

export class InsertRole1752526701059 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `INSERT INTO role (name) VALUES ('gérant'), ('employé');`
        );
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(
            `DELETE FROM role WHERE name IN ('gérant', 'employé');`
        );
    }

}