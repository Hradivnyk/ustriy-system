import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddTicketRating1780982676314 implements MigrationInterface {
  name = 'AddTicketRating1780982676314';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" ADD "rating" integer`);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "rating"`);
  }
}
