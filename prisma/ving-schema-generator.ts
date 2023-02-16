import { generatorHandler, GeneratorOptions } from '@prisma/generator-helper';
import path from 'path';
import fs from 'fs';
const GENERATOR_NAME = 'ving-schema-generator';
import { parse } from 'csv-parse/sync';

const { version } = require('../package.json')

interface Directive {
  labels?: string[],
  editBy?: string[],
  viewBy?: string[],
  owner?: string[],
}

interface EnumList {
  [key: string]: Array<object>
}


generatorHandler({
  onManifest() {
    return {
      version,
      defaultOutput: '../generated',
      prettyName: GENERATOR_NAME,
    }
  },
  onGenerate: async (options: GeneratorOptions) => {
    const outputFolder = options.generator.output?.value || '.';
    const config = options.generator.config;
    let datamodel = options.dmmf.datamodel

    //console.log(JSON.stringify(options))
    //   console.log(JSON.stringify(options.dmmf.datamodel.enums))
    //  console.log(JSON.stringify(options.dmmf.datamodel.models))

    // document enum options with human readable labels
    let enums: EnumList = {}
    for (let value of datamodel.enums) {
      let options: Array<object> = []
      let directives = parseDirectives(value.documentation)
      let labels = directives.labels || []
      let i = 0
      for (let enumValue of value.values) {
        options.push({
          value: enumValue.name,
          text: typeof labels[i] != 'undefined' ? labels[i] : enumValue.name,
        })
        i++
      }
      enums[value.name as keyof EnumList] = options;

    }

    for (let table of datamodel.models) {

      // add whole table directives
      let tableDirectives: Directive = parseDirectives(table.documentation);
      table.ving = { owner: ['admin'] };
      if (tableDirectives.owner) {
        table.ving.owner.push(...tableDirectives.owner);
      }

      for (let field of table.fields) {

        field.ving = { options: [], editBy: [], viewBy: [] };

        // add enums as options
        if (field.kind == 'enum') {
          field.ving.options = enums[field.type as keyof EnumList];
        }

        // add field directives
        let fieldDirectives: Directive = parseDirectives(field.documentation);
        for (let prop of ['editBy', 'viewBy', 'labels']) {
          let values = fieldDirectives[prop as keyof Directive];
          if (prop == 'labels') {
            if (field.type == 'Boolean') {
              field.ving.options = [{
                value: true,
                text: (values !== undefined && values[0] !== undefined) ? values[0] : 'True',
              }, {
                value: false,
                text: (values !== undefined && values[1] !== undefined) ? values[1] : 'False',
              }];
            }
          }
          else if (typeof values != 'undefined') {
            field.ving[prop].push(...values);
          }
        }

      }

    }

    await writeFileSafely(outputFolder + '/ving-schema.json', JSON.stringify(datamodel.models, undefined, 2));

  },
})

function parseDirectives(string?: String) {
  if (!string) {
    return {}
  }
  let rows = string.split(/\n/)

  let out: Directive = {}
  for (let row of rows) {
    let found = row.match(/^@ving\.(\w+)\s*:\s*(.*)$/)
    if (found != null) {
      let key = found[1];
      let labels = parse(found[2], { ltrim: true, rtrim: true })[0];
      out[key as keyof Directive] = labels;
    }
  }
  return out
}

const writeFileSafely = async (writeLocation: string, content: any) => {
  fs.mkdirSync(path.dirname(writeLocation), {
    recursive: true,
  })

  fs.writeFileSync(writeLocation, content)
}
