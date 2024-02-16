import { getContext, renderTemplate, toFile } from '@featherscloud/pinion';
import fs from 'fs';

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
import { describeParams, getBody, obtainSessionIfRole } from '../../utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name}s = use${name}s();
    const session = obtainSessionIfRole(event, 'verifiedEmail');
    const ${name.toLowerCase()} = await ${name}s.createAndVerify(await getBody(event), session);
    return ${name.toLowerCase()}.describe(describeParams(event, session));
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

export const generateRest = (params) => {
    const context = { ...getContext({}), ...params };
    const folderName = `server/api/${context.name.toLowerCase()}`;
    let gen = Promise.resolve(context);
    let filePath = `${folderName}/[id].delete.mjs`;
    if (!(params.skipExisting && fs.existsSync(filePath)))
        gen = gen.then(renderTemplate(idDeleteTemplate, toFile(filePath)));
    filePath = `${folderName}/[id].get.mjs`;
    if (!(params.skipExisting && fs.existsSync(filePath)))
        gen = gen.then(renderTemplate(idGetTemplate, toFile(filePath)));
    filePath = `${folderName}/[id].put.mjs`;
    if (!(params.skipExisting && fs.existsSync(filePath)))
        gen = gen.then(renderTemplate(idPutTemplate, toFile(filePath)));
    filePath = `${folderName}/index.get.mjs`;
    if (!(params.skipExisting && fs.existsSync(filePath)))
        gen = gen.then(renderTemplate(indexGetTemplate, toFile(filePath)));
    filePath = `${folderName}/index.post.mjs`;
    if (!(params.skipExisting && fs.existsSync(filePath)))
        gen = gen.then(renderTemplate(indexPostTemplate, toFile(filePath)));
    filePath = `${folderName}/options.get.mjs`;
    if (!(params.skipExisting && fs.existsSync(filePath)))
        gen = gen.then(renderTemplate(optionsTemplate, toFile(filePath)));
    for (const prop of context.schema.props) {
        if (prop?.relation?.name)
            filePath = `${folderName}/[id]/${prop.relation.name.toLowerCase()}.get.mjs`;
        if (prop?.relation?.type == 'child' && !(params.skipExisting && fs.existsSync(filePath)))
            gen = gen.then(renderTemplate(childGetTemplate({ name: context.name, prop }), toFile(filePath)));
        else if (prop?.relation?.type == 'parent' && !(params.skipExisting && fs.existsSync(filePath)))
            gen = gen.then(renderTemplate(parentGetTemplate({ name: context.name, prop }), toFile(filePath)));
    }
    return gen;
}