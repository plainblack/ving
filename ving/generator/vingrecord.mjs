import { getContext, renderTemplate, toFile, inject, after } from '@featherscloud/pinion';

function addRelationshipNames({ schema }) {
    const names = [];
    for (const prop of schema.props) {
        if (prop.relation?.type == 'child') {
            names.push('`' + prop.relation.kind + '`');
        }
    }
    return names.join(' and ');
}

function addRelationshipDeletes({ schema }) {
    let out = '';
    for (const prop of schema.props) {
        if (prop.relation && prop.relation?.type == 'child') {
            out += `
            await (await this.children('${prop.relation.name}')).deleteMany();
            `;
        }
    }
    return out;
}

function addRelationshipDelete({ schema }) {
    let count = 0;
    for (const prop of schema.props) {
        if (prop.relation?.type == 'child') {
            count++;
        }
    }
    if (count) {
        return `
        /**
             * Extends \`delete()\` in \`VingRecord\` to delete the associated ${addRelationshipNames({ schema })}.
             * 
             * @see VingRecord.delete()
             */
        async delete () {
            ${addRelationshipDeletes({ schema })}
            await super.delete();
        }
        `;
    }
    return '';
}

const describeExample = ({ bare }) => {
    if (bare)
        return '';
    return `
  /**
   * Extends \`describe()\` in \`VingRecord\` to add \`meta\` property \`bar\`
   *  and the \`extra\` property \`foo\`.
   * 
   * Note, these don't do anything, this is just here to explain how to extend
   * the describe method.
   * 
   * @see VingRecord.describe()
   */
  async describe(params = {}) {
      const out = await super.describe(params);
      if (params?.include?.meta && out.meta) {
          out.meta.bar = 'bar';
      }
      if (params?.include?.extra.includes('foo')) {
          out.extra.foo = 'foo';
      }
      return out;
  }
  `;
}

const describeLinks = ({ name }) => {
    return `
  /**
   * Extends \`describeLinks()\` in \`VingRecord\` 
   * @see VingRecord.describeLinks()
   */
    async describeLinks(idString, restVersion, schema, params = {}) {
        const links = await super.describeLinks(idString, restVersion, schema, params);
        links.view = { href: \`/${name.toLowerCase()}s/\${idString}\`, methods: ['GET'], usage: 'page' };
        links.edit = { href: \`/${name.toLowerCase()}s/\${idString}/edit\`, methods: ['GET'], usage: 'page' };
        links.list = { href: '/${name.toLowerCase()}s', methods: ['GET'], usage: 'page' };
        return links;
    }
  `;
}

const shortcutQueryExample = ({ bare, name }) => {
    if (bare)
        return '';
    return `
    /**
     * An example of a shortcut for a common query you might want to make.
     * 
     * @returns a list of \`${name}Record\`s that are cool
     */
    async findCool() {
        return this.select.findMany(eq(this.table.isCool, true));
    }
    `;
}

const recordTemplate = ({ name, bare, schema }) =>
    `import { VingRecord, VingKind } from "#ving/record/VingRecord.mjs";
${bare ? '' : "import {eq} from '#ving/drizzle/orm.mjs';"}
${bare ? '' : "import { isUndefined } from '#ving/utils/identify.mjs';"}

/** Management of individual ${name}s.
 * @class
 */
export class ${name}Record extends VingRecord {
    // add custom Record code here
    ${describeExample({ bare })}
    ${describeLinks({ bare, name })}
    ${addRelationshipDelete({ schema })}
}

/** Management of all ${name}s.
 * @class
 */
export class ${name}Kind extends VingKind  {
    // add custom Kind code here
    ${shortcutQueryExample({ bare, name })}
}`;

export const generateRecord = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(recordTemplate, toFile(`ving/record/records/${context.name}.mjs`)))
        .then(inject(`import { ${context.name}Record, ${context.name}Kind } from "#ving/record/records/${context.name}.mjs";`, after('import { UserRecord, UserKind } from "#ving/record/records/User.mjs";'), toFile('ving/record/map.mjs')))
        .then(inject(`    ${context.name}: ${context.name}Record,`, after('    User: UserRecord,'), toFile('ving/record/map.mjs')))
        .then(inject(`    ${context.name}: ${context.name}Kind,`, after('    User: UserKind,'), toFile('ving/record/map.mjs')));
}