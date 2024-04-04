import { renderTemplate, toFile, getContext } from '@featherscloud/pinion';

export const makeBaseTable = (schema) => {
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

export const makeTable = ({ schema }) => {
    const references = [];
    for (const prop of schema.props) {
        if (prop.relation && ['parent', 'sibling'].includes(prop.relation.type)) {
            references.push(`import {${prop.relation.kind}Table} from '#ving/drizzle/schema/${prop.relation.kind}.mjs';`);
        }
    }
    return `import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, varchar, text, int, json, mediumText } from '#ving/drizzle/orm.mjs';
${references.join("\n")}

${makeBaseTable(schema)}
`;
}

export const makeTableFile = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(makeTable, toFile(`ving/drizzle/schema/${context.schema.kind}.mjs`), { force: true }))
}