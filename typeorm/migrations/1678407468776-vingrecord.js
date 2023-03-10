const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class vingrecord1678407468776 {
    name = 'vingrecord1678407468776'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6)
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6)
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`updatedAt\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`createdAt\`
        `);
    }
}
