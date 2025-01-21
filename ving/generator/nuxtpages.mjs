import { getContext, renderTemplate, toFile } from '@featherscloud/pinion';
import { splitByCase, upperFirst } from 'scule';
import { stringDefault, booleanDefault, numberDefault } from '#ving/schema/helpers.mjs';
import { isUndefined } from '#ving/utils/identify.mjs';

const makeWords = (value) => splitByCase(value).join(' ');
const makeLabel = (value) => upperFirst(splitByCase(value).join(' '));

const columns = (name, schema) => {
    let out = '';
    for (const prop of schema.props) {
        if (prop.name == 'email') {
            out += `
            <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable>
                <template #body="slotProps">
                    <a :href="\`mailto:\${slotProps.data.props.email}\`">{{ slotProps.data.props.email }}</a>
                </template>
            </Column>`;
        }
        else if (['name', 'id'].includes(prop.name)) {
            out += `
            <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable>
                <template #body="slotProps">
                    <NuxtLink :to="slotProps.data.links?.view?.href">
                        {{ slotProps.data.props.${prop.name} }}
                    </NuxtLink>
                </template>
            </Column>`;
        }
        else if (['boolean', 'enum'].includes(prop.type)) {
            out += `
            <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable>
                <template #body="slotProps">
                    {{ enum2label(slotProps.data.props.${prop.name}, ${schema.tableName}.propsOptions.${prop.name}) }}
                </template>
            </Column>`;
        }
        else if (prop.relation?.kind == 'User' && prop.relation.type == 'parent') {
            out += `
        <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable>
            <template #body="slotProps">
                <UserProfileLink :user="slotProps.data.related?.${prop.relation?.name}" />
            </template>
        </Column>`;
        }
        else if (prop.relation?.kind == 'S3File' && prop.relation.type == 'parent') {
            out += `
        <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable>
            <template #body="slotProps">
                <Image size="50" :src="slotProps.data.related?.${prop.relation?.name}?.links?.thumbnail?.href" alt="thumbnail" :title="slotProps.data.related?.${prop.relation?.name}?.props?.filename + ' thumbnail'"/>
            </template>
        </Column>`;
        }
        else if (prop.type == 'date') {
            out += `
            <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable>
                <template #body="slotProps">
                    {{ formatDateTime(slotProps.data.props.${prop.name}) }}
                </template>
            </Column>`;
        }
        else if (prop.type != 'virtual') {
            out += `
            <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable></Column>`;
        }
    }
    return out;
}

const prop2type = (prop) => {
    if (prop.name == 'email') {
        return 'email';
    }
    if (prop.type == 'int') {
        return 'number';
    }
    if (prop.type == 'string' && (prop.length > 256 || isUndefined(prop.length))) {
        return 'textarea';
    }
    else {
        return 'text';
    }
}

const createProps = (schema) => {
    let out = '';
    for (const prop of schema.props) {
        if (prop.required && prop.edit.length > 0) {
            if (['enum', 'boolean'].includes(prop.type)) {
                out += `
                    <FormInput name="${prop.name}" type="select" :options="${schema.tableName}.propsOptions?.${prop.name}" v-model="${schema.tableName}.new.${prop.name}" label="${makeLabel(prop.name)}" class="mb-4" />`;
            }
            else if (prop.type != 'virtual') {
                out += `
                    <FormInput name="${prop.name}" type="${prop2type(prop)}" v-model="${schema.tableName}.new.${prop.name}" required label="${makeLabel(prop.name)}" class="mb-4" />`;
            }
        }
    }
    return out;
}

const newDefaults = (schema) => {
    let out = [];
    for (const prop of schema.props) {
        if (prop.edit.length > 0 && (prop.required || prop.relation?.type == 'parent')) {
            if (prop.type == 'string' || prop.type == 'enum')
                out.push([prop.name, "'" + stringDefault(prop) + "'"].join(': '))
            else if (prop.type == 'boolean')
                out.push([prop.name, booleanDefault(prop)].join(': '))
            else if (prop.type == 'number')
                out.push([prop.name, numberDefault(prop)].join(': '))
            else if (prop.type == 'date')
                out.push([prop.name, 'new Date()'].join(': '))
            else if (prop.type != 'virtual')
                out.push([prop.name, "''"].join(': '))
        }
    }
    return out.join(', ');
}

const indexTemplate = ({ name, schema }) =>
    `<template>
    <Title>${makeWords(name)}s</Title>
    <PanelFrame title="${makeWords(name)}s">
        <template #content>
            <PanelZone title="Existing ${makeWords(name)}s">
                <InputGroup>
                    <InputGroupAddon>
                        <Icon name="ion:search" />
                    </InputGroupAddon>
                    <InputText type="text" placeholder="${makeWords(name)}s" class="w-full"
                        v-model="${schema.tableName}.query.search" @keydown.enter="${schema.tableName}.search()" />
                    <Button label="Search" @mousedown="${schema.tableName}.search()" />
                </InputGroup>

                <DataTable :value="${schema.tableName}.records" stripedRows @sort="(e) => ${schema.tableName}.sortDataTable(e)">
                    ${columns(name, schema)}
                    <Column header="Manage">
                        <template #body="slotProps">
                            <ManageButton severity="primary" :items="[
                                { icon:'ph:eye', label:'View', to:slotProps.data.links?.view?.href },
                                { icon:'ph:pencil', label:'Edit', to:slotProps.data.links?.edit?.href },
                                { icon:'ph:trash', label:'Delete', action:slotProps.data.delete}
                                ]" /> 
                        </template>
                    </Column>
                </DataTable>
                <Pager :kind="${schema.tableName}" />
            </PanelZone>
            <PanelZone title="Create ${makeWords(name)}">
                <VForm :send="() => ${schema.tableName}.create()">
                    ${createProps(schema)}
                    <div>
                        <Button type="submit" class="w-auto" severity="success">
                            <Icon name="ph:plus" class="mr-1"/> Create ${makeWords(name)}
                        </Button>
                    </div>
                </VForm>
            </PanelZone>
        </template>
    </PanelFrame>
</template>

<script setup>
const ${schema.tableName} = useVingKind({
    listApi: \`/api/\${useRestVersion()}/${name.toLowerCase()}s\`,
    createApi: \`/api/\${useRestVersion()}/${name.toLowerCase()}s\`,
    query: { includeMeta: true, sortBy: 'createdAt', sortOrder: 'desc' ${includeRelatedTemplate(schema)} },
    newDefaults: { ${newDefaults(schema)} },
    onCreate(props) {
        navigateTo(props.links.edit.href)
    },
});
await Promise.all([
    ${schema.tableName}.search(),
    ${schema.tableName}.fetchPropsOptions(),
]);
onBeforeRouteLeave(() => ${schema.tableName}.dispose());
</script>`;

const viewProps = (schema) => {
    let out = '';
    for (const prop of schema.props) {
        if (prop.view.length > 0 || prop.edit.length > 0) {
            if (prop.type == 'date') {
                out += `
            <div><b>${makeLabel(prop.name)}</b>: {{formatDateTime(${schema.kind.toLowerCase()}.props?.${prop.name})}}</div>
            `;
            }
            else if (['boolean', 'enum'].includes(prop.type)) {
                out += `
            <div><b>${makeLabel(prop.name)}</b>: {{enum2label(${schema.kind.toLowerCase()}.props?.${prop.name}, ${schema.kind.toLowerCase()}.options?.${prop.name})}}</div>
            `;
            }
            else if (prop.relation?.kind == 'User' && prop.relation.type == 'parent') {
                out += `
            <div><b>${makeLabel(prop.name)}</b>: <UserProfileLink :user="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}" /></div>
            `;
            }
            else if (prop.relation?.kind == 'S3File' && prop.relation.type == 'parent') {
                out += `
            <div><b>${makeLabel(prop.name)}</b>: 
                <Image size="100" :src="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.links?.thumbnail?.href" alt="thumbnail" :title="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.props?.filename + ' thumbnail'">
                    <template v-if="['png','jpg','gif'].includes(${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.props?.extension)" #image>
                        <img :src="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.links?.file?.href" alt="file" :title="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.props?.filename + ' full size image'" />
                    </template>
                </Image>
            </div>
            `;
            }
            else if (prop.type == 'id') {
                if (prop.relation?.type == 'parent') {
                    out += `
                    <div><b>${makeLabel(prop.name)}</b>: <NuxtLink :to="${schema.kind.toLowerCase()}.links?.view?.href">{{${schema.kind.toLowerCase()}.props?.${prop.name}}}</NuxtLink> <CopyToClipboard :text="${schema.kind.toLowerCase()}.props?.${prop.name}" size="xs" /></div>
                    `;
                }
                else {
                    out += `
                    <div><b>${makeLabel(prop.name)}</b>: {{${schema.kind.toLowerCase()}.props?.${prop.name}}} <CopyToClipboard :text="${schema.kind.toLowerCase()}.props?.${prop.name}" size="xs" /></div>
                    `;
                }
            }
            else if (prop.type != 'virtual') {
                out += `
            <div><b>${makeLabel(prop.name)}</b>: {{${schema.kind.toLowerCase()}.props?.${prop.name}}}</div>
            `;
            }
        }
    }
    return out;
};

const includeRelatedTemplate = (schema) => {
    const related = [];
    for (const prop of schema.props) {
        if (prop.view.length > 0 || prop.edit.length > 0) {
            if (['S3File', 'User'].includes(prop.relation?.kind)) {
                related.push(prop.relation.name);
            }
        }
    }
    if (related.length)
        return `, includeRelated: ['${related.join(',')}']`;
    return '';
};

const nameOrId = (schema) => schema.props.find((prop) => prop.name == 'name') ? 'name' : 'id';


const viewTemplate = ({ name, schema }) =>
    `<template>
    <Title>{{${name.toLowerCase()}.props?.${nameOrId(schema)}}}</Title>
    <PanelFrame :title="${name.toLowerCase()}.props?.${nameOrId(schema)}" section="${makeWords(name)}s">
        <template #left>
            <PanelNav :links="[
                { label: '${makeWords(name)}s', to: ${name.toLowerCase()}.links?.list?.href, icon: 'ep:back' },
            ]" />
        </template>
        <template #content>
            <PanelZone v-if="${name.toLowerCase()}.props?.id">
                ${viewProps(schema)}
            </PanelZone>
            <div v-if="${name.toLowerCase()}.meta?.isOwner">
                <NuxtLink :to="${name.toLowerCase()}.links?.edit?.href" class="no-underline mr-2 mb-2">
                    <Button severity="success" title="Edit" alt="Edit ${makeWords(name)}"><Icon name="ph:pencil" class="mr-1"/> Edit</Button>
                </NuxtLink>
                <Button @mousedown="${name.toLowerCase()}.delete()" severity="danger" title="Delete" alt="Delete ${makeWords(name)}"><Icon name="ph:trash" class="mr-1"/> Delete</Button>
            </div>
        </template>
    </PanelFrame>
</template>
  
<script setup>
const route = useRoute();
const id = route.params.id.toString();
const ${name.toLowerCase()} = useVingRecord({
    id,
    fetchApi: \`/api/\${useRestVersion()}/${name.toLowerCase()}s/\${id}\`,
    query: { includeMeta: true, includeOptions: true ${includeRelatedTemplate(schema)} },
    async onDelete() {
        await navigateTo(${name.toLowerCase()}.links.list.href);
    },
});
await ${name.toLowerCase()}.fetch();
onBeforeRouteLeave(() => ${name.toLowerCase()}.dispose());
</script>`;

const editProps = (schema) => {
    let out = '';
    for (const prop of schema.props) {
        if (prop.edit.length > 0) {
            if (['enum', 'boolean'].includes(prop.type)) {
                out += `
                    <FormInput name="${prop.name}" type="select" :options="${schema.kind.toLowerCase()}.options?.${prop.name}" v-model="${schema.kind.toLowerCase()}.props.${prop.name}" label="${makeLabel(prop.name)}" @change="${schema.kind.toLowerCase()}.save('${prop.name}')" class="mb-4" />`;
            }
            else if (prop.type == 'id' && prop?.relation?.type == 'parent' && prop.relation?.kind == 'S3File') {
                out += `
                    <div class="mb-4">
                        <Dropzone id="${prop?.relation?.name}" :acceptedFiles="${schema.kind.toLowerCase()}.options?.${prop?.relation?.name}" :afterUpload="(s3file) => ${schema.kind.toLowerCase()}.importS3File('${prop?.relation?.name}', s3file.props?.id)"
                            :maxFiles="1" :resizeHeight="300" :resizeWidth="300" resizeMethod="crop"></Dropzone>
                    </div>`;
            }
            else if (prop.type != 'virtual') {
                out += `
                    <FormInput name="${prop.name}" type="${prop2type(prop)}" v-model="${schema.kind.toLowerCase()}.props.${prop.name}" ${prop.required ? 'required' : ''} label="${makeLabel(prop.name)}" @change="${schema.kind.toLowerCase()}.save('${prop.name}')" class="mb-4" />`;
            }
        }
    }
    return out;
}

const statProps = (schema) => {
    let out = '';
    for (const prop of schema.props) {
        if (prop.view.length > 0 && prop.edit.length == 0) {
            if (prop.type == 'date') {
                out += `
            <div class="mb-4"><b>${makeLabel(prop.name)}</b>: {{formatDateTime(${schema.kind.toLowerCase()}.props.${prop.name})}}</div>
            `;
            }
            else if (prop.type == 'id') {
                if (prop.relation?.type == 'parent') {
                    out += `
                    <div class="mb-4"><b>${makeLabel(prop.name)}</b>: <NuxtLink :to="${schema.kind.toLowerCase()}.links?.view?.href">{{${schema.kind.toLowerCase()}.props?.${prop.name}}}</NuxtLink> <CopyToClipboard :text="${schema.kind.toLowerCase()}.props?.${prop.name}" size="xs" /></div>
                    `;
                }
                else {
                    out += `
                    <div class="mb-4"><b>${makeLabel(prop.name)}</b>: {{${schema.kind.toLowerCase()}.props?.${prop.name}}} <CopyToClipboard :text="${schema.kind.toLowerCase()}.props?.${prop.name}" size="xs" /></div>
                    `;
                }
            }
            else if (prop.type != 'virtual') {
                out += `
            <div class="mb-4"><b>${makeLabel(prop.name)}</b>: {{${schema.kind.toLowerCase()}.props?.${prop.name}}}</div>
            `;
            }
        }
    }
    return out;
}

const editTemplate = ({ name, schema }) =>
    `<template>
    <Title>Edit {{${name.toLowerCase()}.props?.${nameOrId(schema)}}}</Title>
    <PanelFrame :title="'Edit '+${name.toLowerCase()}.props?.${nameOrId(schema)}" section="${makeWords(name)}s">
        <template #left>
            <PanelNav :links="[
                { label: '${makeWords(name)}s', to: ${name.toLowerCase()}.links?.list?.href, icon: 'ep:back' },
            ]" />
        </template>
        <template #content>
            <FieldsetNav v-if="${name.toLowerCase()}.props">
                <FieldsetItem name="Properties">
                    ${editProps(schema)}
                </FieldsetItem>

                <FieldsetItem name="Statistics">
                    ${statProps(schema)}
                </FieldsetItem>

                <FieldsetItem name="Actions">
                    <NuxtLink :to="${name.toLowerCase()}.links?.view?.href" class="no-underline">
                        <Button title="View" alt="View ${makeWords(name)}" class="mr-2 mb-2"><Icon name="ph:eye" class="mr-1"/> View</Button>
                    </NuxtLink>
                    <Button @mousedown="${name.toLowerCase()}.delete()" severity="danger" class="mr-2 mb-2" title="Delete" alt="Delete ${makeWords(name)}"><Icon name="ph:trash" class="mr-1"/> Delete</Button>
                </FieldsetItem>
            </FieldsetNav>
        </template>
    </PanelFrame>
</template>
  
<script setup>
definePageMeta({
    middleware: ['auth']
});
const route = useRoute();
const notify = useNotify();
const id = route.params.id.toString();
const ${name.toLowerCase()} = useVingRecord({
    id,
    fetchApi: \`/api/\${useRestVersion()}/${name.toLowerCase()}s/\${id}\`,
    createApi: \`/api/\${useRestVersion()}/${name.toLowerCase()}s\`,
    query: { includeMeta: true, includeOptions: true ${includeRelatedTemplate(schema)} },
    onUpdate() {
        notify.success('Updated ${makeWords(name)}.');
    },
    async onDelete() {
        await navigateTo(${name.toLowerCase()}.links.list.href);
    },
});
await ${name.toLowerCase()}.fetch()
onBeforeRouteLeave(() => ${name.toLowerCase()}.dispose());
</script>`;

export const generateWeb = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(indexTemplate, toFile(`app/pages/${context.name.toLowerCase()}s/index.vue`)))
        .then(renderTemplate(viewTemplate, toFile(`app/pages/${context.name.toLowerCase()}s/[id]/index.vue`)))
        .then(renderTemplate(editTemplate, toFile(`app/pages/${context.name.toLowerCase()}s/[id]/edit.vue`)))
}

