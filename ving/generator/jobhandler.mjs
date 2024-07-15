import { getContext, renderTemplate, toFile, inject, after } from '@featherscloud/pinion';

const jobHandlerTemplate = ({ name, prop }) =>
    `import ving from '#ving/index.mjs';
import { useKind } from '#ving/record/utils.mjs';


/**
 * This handler does something with SomeRecord. 
 * @param {Object} A \`BullMQ\` job.
 * @returns {boolean} \`true\`
 */
export default async function (job) {
    ving.log('jobs').info(\`Instanciating a record based upon \${job.data.id}\`);
    const records = await useKind('SomeRecord');
    const record = await records.findOrDie(job.data.id);
    // do something
    // throw ving.ouch(500, 'Some error');
    ving.log('jobs').info(\`SomeRecord \${job.data.id} did something.\`);
    return true;
}`;

export const generateJobHandler = async (params) => {
    const context = { ...getContext({}), ...params };
    let gen = Promise.resolve(context);
    gen = gen.then(renderTemplate(jobHandlerTemplate, toFile(`ving/jobs/handlers/${context.name}.mjs`)))
        .then(inject(`import ${context.name} from "#ving/jobs/handlers/${context.name}.mjs";`, after('import Test from "#ving/jobs/handlers/Test.mjs";'), toFile('ving/jobs/map.mjs')))
        .then(inject(`    ${context.name},`, after('    Test,'), toFile('ving/jobs/map.mjs')));

    return gen;
}