const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class passwordtype1678594488770 {
    name = 'passwordtype1678594488770'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`passwordType\` \`passwordType\` enum ('bcrypt') NOT NULL DEFAULT 'bcrypt'
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`passwordType\` \`passwordType\` enum ('argon2') NOT NULL DEFAULT 'argon2'
        `);
    }
}
