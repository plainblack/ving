const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class vingSchema1678430611211 {
    name = 'vingSchema1678430611211'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`admin\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`developer\` tinyint NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`username\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`username\` varchar(60) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD UNIQUE INDEX \`IDX_78a916df40e02a9deb1c4b75ed\` (\`username\`)
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP INDEX \`IDX_78a916df40e02a9deb1c4b75ed\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`username\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\`
            ADD \`username\` text NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`developer\`
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` DROP COLUMN \`admin\`
        `);
    }
}
