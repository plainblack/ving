const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class roles1678490629939 {
    name = 'roles1678490629939'

    async up(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`username\` \`username\` varchar(60) NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`email\` \`email\` varchar(255) NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`realName\` \`realName\` varchar(60) NOT NULL DEFAULT ''
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(60) NOT NULL DEFAULT ''
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`password\` \`password\` varchar(60) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`realName\` \`realName\` varchar(60) NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`email\` \`email\` varchar(255) NOT NULL
        `);
        await queryRunner.query(`
            ALTER TABLE \`user\` CHANGE \`username\` \`username\` varchar(60) NOT NULL
        `);
    }
}
