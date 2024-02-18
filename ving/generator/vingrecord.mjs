import { getContext, renderTemplate, toFile } from '@featherscloud/pinion';
import { camelCase } from 'scule';

function addImports({ schema }) {
    let out = '';
    for (const prop of schema.props) {
        if (prop.relation) {
            out += `import { use${prop.relation.kind}s } from '#ving/record/records/${prop.relation.kind}.mjs';` + "\n";
        }
    }
    return out;
}

function addRelationshipNames({ schema }) {
    const names = [];
    for (const prop of schema.props) {
        if (prop.relation) {
            names.push(prop.relation.kind);
        }
    }
    return names.join(' and ');
}

function addRelationshipDeletes({ schema }) {
    let out = '';
    for (const prop of schema.props) {
        if (prop.relation && prop.relation.type == 'parent') {
            out += `
            if (this.get('${prop.name}')) {
                const ${prop.relation.name} = await this.${prop.relation.name}();
                await ${prop.relation.name}.delete();
            }
            `;
        }
        else if (prop.relation && prop.relation.type == 'child') {
            out += `
            await this.${prop.relation.name}.deleteMany();
            `;
        }
    }
    return out;
}

function addRelationshipDelete({ schema }) {
    let count = 0;
    for (const prop of schema.props) {
        if (prop.relation) {
            count++;
        }
    }
    if (count) {
        return `
        /**
             * Extends \`delete()\` in \`VingRecord\` to delete ${addRelationshipNames({ schema })} the user created.
             * 
             * @see VingRecord.delete()
             */
        async delete () {
            ${addRelationshipDeletes({ schema })}
        }
        `;
    }
    return '';
}

const recordTemplate = ({ name, schema }) =>
    `import { VingRecord, VingKind } from "#ving/record/VingRecord.mjs";
import { useDB } from '#ving/drizzle/db.mjs';
import { ${name}Table } from '#ving/drizzle/schema/${name}.mjs';
${addImports({ schema })}

/** Management of individual ${name}s.
 * @class
 */
export class ${name}Record extends VingRecord {
    // add custom Record code here

    /**
     * Extends \`describe()\` in \`VingRecord\` to add \`meta\` property \`bar\`
     *  and the \`extra\` property \`foo\`.
     * 
     * @see VingRecord.describe()
     */
    async describe(params = {}) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            out.meta.bar = 'bar';
        }
        if (params?.include?.extra.includes('foo')) {
            if (out.extra === undefined) {
                out.extra = {};
            }
            out.extra.foo = 'foo';
        }
        return out;
    }

    ${addRelationshipDelete({ schema })}
}

/** Management of all ${name}s.
 * @class
 */
export class ${name}Kind extends VingKind  {
    // add custom Kind code here
}`;

export const generateRecord = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(recordTemplate, toFile(`ving/record/records/${context.name}.mjs`)));
}