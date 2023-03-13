const { MigrationInterface, QueryRunner } = require("typeorm");

module.exports = class apikeys1678729194755 {
    name = 'apikeys1678729194755'

    async up(queryRunner) {
        await queryRunner.query(`
            CREATE TABLE \`api_key\` (
                \`id\` varchar(36) NOT NULL,
                \`createdAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6),
                \`updatedAt\` timestamp(6) NOT NULL DEFAULT CURRENT_TIMESTAMP(6) ON UPDATE CURRENT_TIMESTAMP(6),
                \`name\` varchar(60) NOT NULL DEFAULT '',
                \`url\` text NOT NULL DEFAULT '',
                \`reason\` text NOT NULL DEFAULT '',
                \`privateKey\` varchar(255) NOT NULL,
                \`userId\` varchar(36) NOT NULL,
                PRIMARY KEY (\`id\`)
            ) ENGINE = InnoDB
        `);
        await queryRunner.query(`
            ALTER TABLE \`api_key\`
            ADD CONSTRAINT \`FK_277972f4944205eb29127f9bb6c\` FOREIGN KEY (\`userId\`) REFERENCES \`user\`(\`id\`) ON DELETE CASCADE ON UPDATE CASCADE
        `);
    }

    async down(queryRunner) {
        await queryRunner.query(`
            ALTER TABLE \`api_key\` DROP FOREIGN KEY \`FK_277972f4944205eb29127f9bb6c\`
        `);
        await queryRunner.query(`
            DROP TABLE \`api_key\`
        `);
    }
}
