const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class passwordlength1678579349095 {
    name = 'passwordlength1678579349095'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`password\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`password\` varchar(255) NOT NULL DEFAULT ''
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`password\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`password\` varchar(60) NOT NULL DEFAULT ''
        `);
    }
}
