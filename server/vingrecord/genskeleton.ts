import { PinionContext, generator, renderTemplate, toFile, after, inject } from '@feathershq/pinion';
import { vingSchema, vingProp } from '../../types/vingschema';
import { camelCase } from 'scule';

interface Context extends PinionContext {
    name: string,
    schema: vingSchema,
}

function addImports({ schema }: Pick<Context, 'schema'>) {
    let out = '';
    for (const prop of schema.props) {
        if (prop.relation) {
            out += `import { use${prop.relation.kind}s } from './${prop.relation.kind}';` + "\n";
        }
    }
    return out;
}

const childTemplate = ({ name, prop }: { name: string, prop: vingProp }) => `
    // ${prop.relation!.kind} - child relationship
    public get ${prop.relation!.name}() {
        const ${prop.relation!.kind}s = use${prop.relation!.kind}s();
        ${prop.relation!.kind}s.propDefaults.push({
            prop: '${camelCase(name)}Id',
            field: ${prop.relation!.kind}s.table.${camelCase(name)}Id,
            value: this.get('id')
        });
        return ${prop.relation!.kind}s;
    }
`;

const parentTemplate = ({ name, prop }: { name: string, prop: vingProp }) => `
    // ${prop.relation!.kind} - parent relationship
    public get ${prop.relation!.name}() {
        return use${prop.relation!.kind}s().findOrDie(this.get('${prop.name}'));
    }
`;

function addRelationships({ name, schema }: Pick<Context, 'name' | 'schema'>) {
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

function addFilter({ name, schema }: Pick<Context, 'name' | 'schema'>) {
    if (schema.props.filter((prop) => prop.name == 'name'))
        return `
        // if you want to do some advanced searching via rest
        public describeListFilter() {
            const filter = super.describeListFilter();
            filter.queryable.push(this.table.name);
            //filter.qualifiers.push( column names go here );
            //filter.range.push( number/date column names go here );
            return filter;
        }`;
    else
        return `
        // if you want to do some advanced searching via rest
        /*public describeListFilter() {
            const filter = super.describeListFilter();
            filter.queryable.push(string column names go here);
            filter.qualifiers.push(column names go here);
            filter.range.push(number/date column names go here);
        return filter;
        }*/`;
}

const recordTemplate = ({ name, schema }: Context) =>
    `import { VingRecord, VingKind } from "../VingRecord";
import { useDB } from '../../drizzle/db';
import { ${name}Table } from '../../drizzle/schema/${name}';
${addImports({ schema })}

export class ${name}Record extends VingRecord<'${name}'> {
    // add custom Record code here
    ${addRelationships({ name, schema })}
}

export class ${name}Kind extends VingKind<'${name}', ${name}Record>  {
    // add custom Kind code here
    ${addFilter({ name, schema })}
}

export const use${name}s = () => {
    return new ${name}Kind(useDB(), ${name}Table, ${name}Record);
}`;

export const generateRecord = (context: Context) => generator(context)
    .then(renderTemplate(recordTemplate(context), toFile(`server/vingrecord/records/${context.name}.ts`)))
    .then(inject(`import type { ${context.name}Model } from "../server/drizzle/schema/${context.name}";`, after("import type { APIKeyModel } from '../server/drizzle/schema/APIKey';"), toFile('types/vingrecord.ts')))
    .then(inject(`    ${context.name}: ${context.name}Model;`, after('    APIKey: APIKeyModel;'), toFile('types/vingrecord.ts')));