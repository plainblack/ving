import { PinionContext, generator, renderTemplate, toFile } from '@feathershq/pinion';
import { vingSchema, vingProp } from '../../types/vingschema';

interface Context extends PinionContext {
    name: string,
    schema: vingSchema,
}

const optionsTemplate = ({ name }: Context) =>
    `import { use${name}s } from '../../vingrecord/records/${name}';
import { describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    return ${name}s.mint().propOptions(describeParams(event), true);
});`;

const indexPostTemplate = ({ name }: Context) =>
    `import { use${name}s } from '../../vingrecord/records/${name}';
import { describeParams, getBody, obtainSession } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const ${name.toLowerCase()} = await ${name}s.createAndVerify(await getBody(event), obtainSession(event));
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const indexGetTemplate = ({ name }: Context) =>
    `import { use${name}s } from '../../vingrecord/records/${name}';
import { describeListParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    return await ${name}s.describeList(describeListParams(event));
});`;

const idPutTemplate = ({ name }: Context) =>
    `import { use${name}s } from '../../vingrecord/records/${name}';
import { describeParams, obtainSession, getBody } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    const session = obtainSession(event);
    ${name.toLowerCase()}.canEdit(session);
    await ${name.toLowerCase()}.updateAndVerify(await getBody(event), session);
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const idGetTemplate = ({ name }: Context) =>
    `import { use${name}s } from '../../vingrecord/records/${name}';
import { describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const idDeleteTemplate = ({ name }: Context) =>
    `import { use${name}s } from '../../vingrecord/records/${name}';
import { obtainSession, describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    ${name.toLowerCase()}.canEdit(obtainSession(event));
    await ${name.toLowerCase()}.delete();
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const childGetTemplate = ({ name, prop }: { name: string, prop: vingProp }) =>
    `import { use${name}s } from '../../../vingrecord/records/${name}';
import { describeListParams } from '../../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    return await ${name.toLowerCase()}.${prop.relation!.name}.describeList(describeListParams(event));
});`;

const parentGetTemplate = ({ name, prop }: { name: string, prop: vingProp }) =>
    `import { use${name}s } from '../../../vingrecord/records/${name}';
import { describeParams } from '../../../utils/rest';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    const ${prop.relation!.name} = await ${name.toLowerCase()}.${prop.relation!.name};
    return await ${prop.relation!.name}.describe(describeParams(event));
});`;

export const generateApis = (context: Context) => {
    const gen = generator(context)
        .then(renderTemplate(idDeleteTemplate(context), toFile(`server/api/${context.name.toLowerCase()}/[id].delete.ts`)))
        .then(renderTemplate(idGetTemplate(context), toFile(`server/api/${context.name.toLowerCase()}/[id].get.ts`)))
        .then(renderTemplate(idPutTemplate(context), toFile(`server/api/${context.name.toLowerCase()}/[id].put.ts`)))
        .then(renderTemplate(indexGetTemplate(context), toFile(`server/api/${context.name.toLowerCase()}/index.get.ts`)))
        .then(renderTemplate(indexPostTemplate(context), toFile(`server/api/${context.name.toLowerCase()}/index.post.ts`)))
        .then(renderTemplate(optionsTemplate(context), toFile(`server/api/${context.name.toLowerCase()}/options.get.ts`)));
    for (const prop of context.schema.props) {
        if (prop.relation && prop.relation.type == 'child') {
            gen.then(renderTemplate(childGetTemplate({ name: context.name, prop }), toFile(`server/api/${context.name.toLowerCase()}/[id]/${prop.relation.name}.get.ts`)));
        }
        else if (prop.relation && prop.relation.type == 'parent') {
            gen.then(renderTemplate(parentGetTemplate({ name: context.name, prop }), toFile(`server/api/${context.name.toLowerCase()}/[id]/${prop.relation.name}.get.ts`)));
        }
    }
}