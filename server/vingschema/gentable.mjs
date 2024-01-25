import { writeFileSafely } from './helpers.mjs';
import { vingSchemas } from './index.mjs';


export const makeTable = (schema) => {
    const columns = [];
    const uniqueIndexes = [];
    for (const prop of schema.props) {
        if (prop.type != 'virtual') {
            columns.push(`${prop.name}: ${prop.db(prop)}`)
            if (prop.unique) {
                uniqueIndexes.push(`${prop.name}Index: uniqueIndex('${prop.name}Index').on(table.${prop.name})`);
            }
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

export const makeTableFile = async (schema) => {
    const references = [];
    for (const prop of schema.props) {
        if (prop.relation && ['parent', 'sibling'].includes(prop.relation.type)) {
            references.push(`import {${prop.relation.kind}Table} from './${prop.relation.kind}';`);
        }
    }
    const content = `import { boolean, mysqlEnum, mysqlTable, timestamp, uniqueIndex, varchar, text } from '../orm';
${references.join("\n")}

${makeTable(schema)}

`;
    const path = `server/drizzle/schema/${schema.kind}.ts`;
    await writeFileSafely(path, content);
    console.log('Generated ' + path)
}