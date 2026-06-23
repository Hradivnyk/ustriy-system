import type { MigrationInterface, QueryRunner } from 'typeorm';

export class AddStaffSpecializationAndTicketAssignee1780992537516 implements MigrationInterface {
  name = 'AddStaffSpecializationAndTicketAssignee1780992537516';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "staff" ADD "specialistId" integer`);
    await queryRunner.query(
      `ALTER TABLE "staff"
         ADD CONSTRAINT "FK_staff_specialistId"
         FOREIGN KEY ("specialistId") REFERENCES "specialists"("id")
         ON DELETE SET NULL ON UPDATE NO ACTION`,
    );

    await queryRunner.query(`ALTER TABLE "tickets" ADD "assigneeId" uuid`);
    await queryRunner.query(
      `ALTER TABLE "tickets"
         ADD CONSTRAINT "FK_tickets_assigneeId"
         FOREIGN KEY ("assigneeId") REFERENCES "staff"("id")
         ON DELETE SET NULL ON UPDATE NO ACTION`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "tickets" DROP CONSTRAINT "FK_tickets_assigneeId"`,
    );
    await queryRunner.query(`ALTER TABLE "tickets" DROP COLUMN "assigneeId"`);
    await queryRunner.query(
      `ALTER TABLE "staff" DROP CONSTRAINT "FK_staff_specialistId"`,
    );
    await queryRunner.query(`ALTER TABLE "staff" DROP COLUMN "specialistId"`);
  }
}
