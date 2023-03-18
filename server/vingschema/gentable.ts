import { writeFileSafely } from './helpers';
import { vingSchemas } from './index';
import type { vingSchema } from '../../types';


export const makeTable = (schema: vingSchema) => {
    const columns: string[] = [];
    const uniqueIndexes: string[] = [];
    for (const prop of schema.props) {
        columns.push(`${prop.name}: ${prop.db(prop as never)}`)
        if (prop.unique) {
            uniqueIndexes.push(`${prop.name}Index: uniqueIndex('${prop.name}Index').on(table.${prop.name})`);
        }
    }
    return `
export const ${schema.kind}Table = mysqlTable('${schema.tableName}',
    {
        ${columns.join(",\n\t\t")}
    }, 
    (table) => ({
        ${uniqueIndexes.join(",\n\t\t")}
    })
);
`;
}

export const makeTableFile = async (schema: vingSchema) => {
    const references: string[] = [];
    for (const prop of schema.props) {
        if (prop.relation && ['parent', 'sibling'].includes(prop.relation.type)) {
            references.push(`import {${prop.relation.kind}Table} from './${prop.relation.kind}';`);
        }
    }
    const content = `import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text } from 'drizzle-orm/mysql-core';
${references.join("\n")}

${makeTable(schema)}

export type ${schema.kind}Model = typeof ${schema.kind}Table;
`;
    const path = `server/drizzle/schema/${schema.kind}.ts`;
    await writeFileSafely(path, content);
    console.log('Generated ' + path)
}

for (const schema of vingSchemas) {
    makeTableFile(schema);
}