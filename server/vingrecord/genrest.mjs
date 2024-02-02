import { getContext, renderTemplate, toFile } from '@featherscloud/pinion';

const optionsTemplate = ({ name }) =>
    `import { use${name}s } from '../../vingrecord/records/${name}.mjs';
import { describeParams } from '../../utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    return ${name}s.mint().propOptions(describeParams(event), true);
});`;

const indexPostTemplate = ({ name }) =>
    `import { use${name}s } from '../../vingrecord/records/${name}.mjs';
import { describeParams, getBody, obtainSession } from '../../utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const ${name.toLowerCase()} = await ${name}s.createAndVerify(await getBody(event), obtainSession(event));
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const indexGetTemplate = ({ name }) =>
    `import { use${name}s } from '../../vingrecord/records/${name}.mjs';
import { describeListParams, describeListWhere } from '../../utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    return await ${name}s.describeList(describeListParams(event), describeListWhere(event, ${name}s.describeListFilter()));
});`;

const idPutTemplate = ({ name }) =>
    `import { use${name}s } from '../../vingrecord/records/${name}.mjs';
import { describeParams, obtainSession, getBody } from '../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    const session = obtainSession(event);
    ${name.toLowerCase()}.canEdit(session);
    await ${name.toLowerCase()}.updateAndVerify(await getBody(event), session);
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const idGetTemplate = ({ name }) =>
    `import { use${name}s } from '../../vingrecord/records/${name}.mjs';
import { describeParams } from '../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const idDeleteTemplate = ({ name }) =>
    `import { use${name}s } from '../../vingrecord/records/${name}.mjs';
import { obtainSession, describeParams } from '../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    ${name.toLowerCase()}.canEdit(obtainSession(event));
    await ${name.toLowerCase()}.delete();
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const childGetTemplate = ({ name, prop }) =>
    `import { use${name}s } from '../../../vingrecord/records/${name}.mjs';
import { describeListParams } from '../../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    const ${prop.relation.kind}s = ${name.toLowerCase()}.${prop.relation.name};
    return await ${prop.relation.kind}s.describeList(describeListParams(event), describeListWhere(event, ${prop.relation.kind}s.describeListFilter()));
});`;

const parentGetTemplate = ({ name, prop }) =>
    `import { use${name}s } from '../../../vingrecord/records/${name}.mjs';
import { describeParams } from '../../../utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name}s.findOrDie(id);
    const ${prop.relation.name} = await ${name.toLowerCase()}.${prop.relation.name};
    return await ${prop.relation.name}.describe(describeParams(event));
});`;

export const generateApis = (params) => {
    const context = { ...getContext({}), ...params };
    const folderName = context.name.toLowerCase();
    const gen = Promise.resolve(context)
        .then(renderTemplate(idDeleteTemplate, toFile(`server/api/${folderName}/[id].delete.mjs`)))
        .then(renderTemplate(idGetTemplate, toFile(`server/api/${folderName}/[id].get.mjs`)))
        .then(renderTemplate(idPutTemplate, toFile(`server/api/${folderName}/[id].put.mjs`)))
        .then(renderTemplate(indexGetTemplate, toFile(`server/api/${folderName}/index.get.mjs`)))
        .then(renderTemplate(indexPostTemplate, toFile(`server/api/${folderName}/index.post.mjs`)))
        .then(renderTemplate(optionsTemplate, toFile(`server/api/${folderName}/options.get.mjs`)));
    for (const prop of context.schema.props) {
        if (prop.relation && prop.relation.type == 'child') {
            gen.then(renderTemplate(childGetTemplate({ name: context.name, prop }), toFile(`server/api/${folderName}/[id]/${prop.relation.name}.get.mjs`)));
        }
        else if (prop.relation && prop.relation.type == 'parent') {
            gen.then(renderTemplate(parentGetTemplate({ name: context.name, prop }), toFile(`server/api/${folderName}/[id]/${prop.relation.name}.get.mjs`)));
        }
    }
    return gen;
}