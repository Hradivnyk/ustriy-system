import type { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1779400000000 implements MigrationInterface {
  name = 'InitialSchema1779400000000';

  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);

    await queryRunner.query(`
      CREATE TABLE "dormitories" (
        "id" SERIAL NOT NULL,
        "number" integer NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_dormitories_number" UNIQUE ("number"),
        CONSTRAINT "PK_dormitories" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "residents" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "telegramId" character varying NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying,
        "isActive" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_residents_telegramId" UNIQUE ("telegramId"),
        CONSTRAINT "UQ_residents_email" UNIQUE ("email"),
        CONSTRAINT "PK_residents" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "public"."staff_role_enum" AS ENUM('specialist', 'dispatcher')`,
    );

    await queryRunner.query(`
      CREATE TABLE "staff" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "googleId" character varying NOT NULL,
        "name" character varying NOT NULL,
        "email" character varying NOT NULL,
        "role" "public"."staff_role_enum" NOT NULL,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_staff_googleId" UNIQUE ("googleId"),
        CONSTRAINT "UQ_staff_email" UNIQUE ("email"),
        CONSTRAINT "PK_staff" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(
      `CREATE TYPE "public"."resident_profiles_residenttype_enum" AS ENUM('student', 'tenant')`,
    );

    await queryRunner.query(`
      CREATE TABLE "resident_profiles" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "residentId" uuid NOT NULL,
        "dormitoryId" integer NOT NULL,
        "roomNumber" character varying NOT NULL,
        "residentType" "public"."resident_profiles_residenttype_enum" NOT NULL,
        "isVerified" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_resident_profiles_residentId" UNIQUE ("residentId"),
        CONSTRAINT "PK_resident_profiles" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE TABLE "email_verifications" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "residentId" character varying NOT NULL,
        "code" character varying NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "isUsed" boolean NOT NULL DEFAULT false,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_email_verifications" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      ALTER TABLE "resident_profiles"
        ADD CONSTRAINT "FK_resident_profiles_residentId"
        FOREIGN KEY ("residentId") REFERENCES "residents"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "resident_profiles"
        ADD CONSTRAINT "FK_resident_profiles_dormitoryId"
        FOREIGN KEY ("dormitoryId") REFERENCES "dormitories"("id") ON DELETE RESTRICT ON UPDATE NO ACTION
    `);
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "resident_profiles" DROP CONSTRAINT "FK_resident_profiles_dormitoryId"`,
    );
    await queryRunner.query(
      `ALTER TABLE "resident_profiles" DROP CONSTRAINT "FK_resident_profiles_residentId"`,
    );
    await queryRunner.query(`DROP TABLE "email_verifications"`);
    await queryRunner.query(`DROP TABLE "resident_profiles"`);
    await queryRunner.query(
      `DROP TYPE "public"."resident_profiles_residenttype_enum"`,
    );
    await queryRunner.query(`DROP TABLE "staff"`);
    await queryRunner.query(`DROP TYPE "public"."staff_role_enum"`);
    await queryRunner.query(`DROP TABLE "residents"`);
    await queryRunner.query(`DROP TABLE "dormitories"`);
  }
}
