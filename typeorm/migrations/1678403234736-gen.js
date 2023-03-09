const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class gen1678403234736 {
    name = 'gen1678403234736'

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
