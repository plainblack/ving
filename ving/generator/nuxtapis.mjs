import { getContext, renderTemplate, toFile } from '@featherscloud/pinion';
import fs from 'fs';
import ving from '#ving/index.mjs';

const optionsTemplate = ({ name }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    return ${name.toLowerCase()}s.mint().propOptions(describeParams(event), true);
});`;

const indexPostTemplate = ({ name }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { describeParams, getBody, obtainSessionIfRole } from '#ving/utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    const session = obtainSessionIfRole(event, 'verifiedEmail');
    const ${name.toLowerCase()} = await ${name.toLowerCase()}s.createAndVerify(await getBody(event), session);
    return ${name.toLowerCase()}.describe(describeParams(event, session));
});`;

const indexGetTemplate = ({ name }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { describeListParams, describeListWhere } from '#ving/utils/rest.mjs';
import {defineEventHandler} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    return await ${name.toLowerCase()}s.describeList(describeListParams(event), describeListWhere(event, ${name.toLowerCase()}s.describeListFilter()));
});`;

const idPutTemplate = ({ name }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { describeParams, obtainSession, getBody } from '#ving/utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name.toLowerCase()}s.findOrDie(id);
    const session = obtainSession(event);
    await ${name.toLowerCase()}.canEdit(session);
    await ${name.toLowerCase()}.updateAndVerify(await getBody(event), session);
    return ${name.toLowerCase()}.describe(describeParams(event, session));
});`;

const idGetTemplate = ({ name }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name.toLowerCase()}s.findOrDie(id);
    return ${name.toLowerCase()}.describe(describeParams(event));
});`;

const idDeleteTemplate = ({ name }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { obtainSession, describeParams } from '#ving/utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name.toLowerCase()}s.findOrDie(id);
    const session = obtainSession(event);
    await ${name.toLowerCase()}.canEdit(session);
    await ${name.toLowerCase()}.delete();
    return ${name.toLowerCase()}.describe(describeParams(event, session));
});`;

const childGetTemplate = ({ name, prop }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { describeListParams } from '#ving/utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name.toLowerCase()}s.findOrDie(id);
    const ${prop.relation.kind}s = await ${name.toLowerCase()}.children('${prop.relation.name.toLowerCase()}');
    return await ${prop.relation.kind.toLowerCase()}s.describeList(describeListParams(event), describeListWhere(event, ${prop.relation.kind.toLowerCase()}s.describeListFilter()));
});`;

const parentGetTemplate = ({ name, prop }) =>
    `import { useKind } from '#ving/record/utils.mjs';
import { describeParams } from '#ving/utils/rest.mjs';
import {defineEventHandler, getRouterParams} from 'h3';
export default defineEventHandler(async (event) => {
    const ${name.toLowerCase()}s = await useKind('${name}');
    const { id } = getRouterParams(event);
    const ${name.toLowerCase()} = await ${name.toLowerCase()}s.findOrDie(id);
    const ${prop.relation.name.toLowerCase()} = await ${name.toLowerCase()}.parent('${prop.relation.name.toLowerCase()}');
    return await ${prop.relation.name.toLowerCase()}.describe(describeParams(event));
});`;

export const generateRest = (params) => {
    const context = { ...getContext({}), ...params };
    const folderName = `server/api/${ving.getConfig().rest.version}/${context.name.toLowerCase()}`;
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