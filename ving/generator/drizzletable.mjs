import { renderTemplate, toFile, getContext } from '@featherscloud/pinion';
import { miniHash } from '#ving/utils/miniHash.mjs';

export const makeBaseTable = (schema) => {
    const columns = [];
    const specialConstraints = [];
    for (const prop of schema.props) {
        if (prop.type != 'virtual') {
            columns.push(`${prop.name}: ${prop.db(prop)}`)
            if (prop.unique) {
                specialConstraints.push(`${prop.name}Index: uniqueIndex('${prop.name}Index').on(table.${prop.name})`);
            }
            if (prop.relation && ['parent', 'sibling'].includes(prop.relation.type)) {
                const composite = [schema.tableName, prop.relation.name].join('_');
                const key = composite.substring(0, 48) + '_' + miniHash(composite) + '_fk';
                specialConstraints.push(`${key}: foreignKey({ name: "${key}", columns: [table.${prop.name}], foreignColumns: [${prop.relation?.kind}Table.id]}).onDelete(${prop.required ? '"cascade"' : '"set null"'}).onUpdate(${prop.required ? '"cascade"' : '"no action"'})`);
            }
        }
    }
    return `
export const ${schema.kind}Table = mysqlTable('${schema.tableName}',
    {
        ${columns.join(",\n\t\t")}
    }, 
    (table) => ({
        ${specialConstraints.join(",\n\t\t")}
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
    return `import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, varchar, text, int, json, mediumText, foreignKey } from '#ving/drizzle/orm.mjs';
${references.join("\n")}

${makeBaseTable(schema)}
`;
}

export const makeTableFile = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(makeTable, toFile(`ving/drizzle/schema/${context.schema.kind}.mjs`), { force: true }))
}