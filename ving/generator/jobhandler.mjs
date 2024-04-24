import { getContext, renderTemplate, toFile } from '@featherscloud/pinion';

const jobHandlerTemplate = ({ name, prop }) =>
    `import ving from '#ving/index.mjs';

/**
 * This handler does something with SomeRecord. 
 * @param {Object} A \`BullMQ\` job.
 * @returns {boolean} \`true\`
 */
export default async function (job) {
    ving.log('jobs').info(\`Instanciating a record based upon \${job.data.id}\`);
    const records = await ving.useKind('SomeRecord');
    const record = await records.findOrDie(job.data.id);
    // do something
    // throw ving.ouch(500, 'Some error');
    ving.log('jobs').info(\`SomeRecord \${job.data.id} did something.\`);
    return true;
}`;

export const generateJobHandler = async (params) => {
    const context = { ...getContext({}), ...params };
    let gen = Promise.resolve(context);
    gen = gen.then(renderTemplate(jobHandlerTemplate, toFile(`ving/jobs/handlers/${context.name}.mjs`)));
    return gen;
}