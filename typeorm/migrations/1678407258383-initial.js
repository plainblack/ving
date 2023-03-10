const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class initial1678407258383 {
    name = 'initial1678407258383'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`user\` (
                \`id\` varchar(36) NOT NULL,
                \`firstName\` text NULL,
                \`lastName\` text NULL,
                \`age\` int NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            DROP TABLE \`user\`
        `);
    }
}
