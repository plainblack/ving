import { generator, renderTemplate, toFile, after, inject } from '@featherscloud/pinion';
import { camelCase } from 'scule';



function addImports({ schema }) {
    let out = '';
    for (const prop of schema.props) {
        if (prop.relation) {
            out += `import { use${prop.relation.kind}s } from './${prop.relation.kind}.mjs';` + "\n";
        }
    }
    return out;
}

const childTemplate = ({ name, prop }) => `
    // ${prop.relation.kind} - child relationship
    get ${prop.relation.name}() {
        const ${prop.relation.kind}s = use${prop.relation.kind}s();
        ${prop.relation.kind}s.propDefaults.push({
            prop: '${camelCase(name)}Id',
            field: ${prop.relation.kind}s.table.${camelCase(name)}Id,
            value: this.get('id')
        });
        return ${prop.relation.kind}s;
    }
`;

const parentTemplate = ({ prop }) => `
    // ${prop.relation.kind} - parent relationship
    get ${prop.relation.name}() {
        return use${prop.relation.kind}s().findOrDie(this.get('${prop.name}'));
    }
`;

function addRelationships({ name, schema }) {
    let out = '';
    for (const prop of schema.props) {
        if (prop.relation && prop.relation.type == 'parent') {
            out += parentTemplate({ name, prop });
        }
        else if (prop.relation && prop.relation.type == 'child') {
            out += childTemplate({ name, prop });
        }
    }
    return out;
}

const recordTemplate = ({ name, schema }) =>
    `import { VingRecord, VingKind } from "../VingRecord.mjs";
import { useDB } from '../../drizzle/db.mjs';
import { ${name}Table } from '../../drizzle/schema/${name}.mjs';
${addImports({ schema })}

export class ${name}Record extends VingRecord {
    // add custom Record code here
    ${addRelationships({ name, schema })}
}

export class ${name}Kind extends VingKind  {
    // add custom Kind code here
}

export const use${name}s = () => {
    return new ${name}Kind(useDB(), ${name}Table, ${name}Record);
}`;

export const generateRecord = (context) => generator(context)
    .then(renderTemplate(recordTemplate(context), toFile(`server/vingrecord/records/${context.name}.mjs`)));