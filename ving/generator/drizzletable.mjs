import { renderTemplate, toFile, getContext, inject, after } from '@featherscloud/pinion';
import { miniHash } from '#ving/utils/miniHash.mjs';
import { isFile } from '#ving/utils/fs.mjs';

export const makeBaseTable = (schema) => {
    const columns = [];
    const specialConstraints = [];
    for (const prop of schema.props) {
        if (prop.type != 'virtual') {
            columns.push(`${prop.name}: ${prop.db(prop)}`)
            if (prop.unique) {
                if (prop.uniqueQualifiers && prop.uniqueQualifiers.length) {
                    const fields = [prop.name, ...prop.uniqueQualifiers];
                    const composite = fields.join('_');
                    const key = composite.substring(0, 48) + '_' + miniHash(composite) + '_uq';
                    specialConstraints.push(`unique('${key}').on(table.${fields.join(', table.')})`);
                }
                else {
                    specialConstraints.push(`uniqueIndex('${prop.name}Index').on(table.${prop.name})`);
                }
            }
            if (prop.relation && ['parent', 'sibling'].includes(prop.relation.type)) {
                const composite = [schema.tableName, prop.relation.name].join('_');
                const key = composite.substring(0, 48) + '_' + miniHash(composite) + '_fk';
                specialConstraints.push(`foreignKey({ name: "${key}", columns: [table.${prop.name}], foreignColumns: [${prop.relation?.kind}Table.id]}).onDelete(${prop.required ? '"cascade"' : '"set null"'}).onUpdate(${prop.required ? '"cascade"' : '"no action"'})`);
            }
        }
    }
    return `
export const ${schema.kind}Table = mysqlTable('${schema.tableName}',
    {
        ${columns.join(",\n\t\t")}
    }, 
    (table) => ([
        ${specialConstraints.join(",\n\t\t")}
    ])
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
    return `import { boolean, mysqlEnum, mysqlTable, timestamp, datetime, uniqueIndex, unique, char, varchar, text, int, bigint, json, mediumText, foreignKey } from '#ving/drizzle/orm.mjs';
${references.join("\n")}

${makeBaseTable(schema)}
`;
}

export const makeTableFile = (params) => {
    const context = { ...getContext({}), ...params };
    const tablePath = `ving/drizzle/schema/${context.schema.kind}.mjs`;
    const alreadyExists = isFile(tablePath)
    const promise = Promise.resolve(context)
        .then(renderTemplate(makeTable, toFile(tablePath), { force: true }));
    if (!alreadyExists) {
        promise
            .then(inject(`import { ${context.name}Table } from "#ving/drizzle/schema/${context.name}.mjs";`, after('import { UserTable } from "#ving/drizzle/schema/User.mjs";'), toFile('ving/drizzle/map.mjs')))
            .then(inject(`    ${context.name}: ${context.name}Table,`, after('    User: UserTable,'), toFile('ving/drizzle/map.mjs')));
    }
    return promise;
}