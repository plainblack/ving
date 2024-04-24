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
                    <NuxtLink :to="\`/${name.toLowerCase()}/\${slotProps.data.props.id}\`" v-ripple>
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
                <Image size="50" :src="slotProps.data.related?.${prop.relation?.name}?.meta?.thumbnailUrl" alt="thumbnail" :title="slotProps.data.related?.${prop.relation?.name}?.props?.filename + ' thumbnail'"/>
            </template>
        </Column>`;
        }
        else if (prop.type == 'date') {
            out += `
            <Column field="props.${prop.name}" header="${makeLabel(prop.name)}" sortable>
                <template #body="slotProps">
                    {{ dt.formatDateTime(slotProps.data.props.${prop.name}) }}
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
                    <div class="mb-4">
                        <FormInput type="select" name="${prop.name}" :options="${schema.tableName}.propsOptions?.${prop.name}" v-model="${schema.tableName}.new.${prop.name}" label="${makeLabel(prop.name)}" />
                    </div>`;
            }
            else if (prop.type != 'virtual') {
                out += `
                    <div class="mb-4">
                        <FormInput type="select" name="${prop.name}" type="${prop2type(prop)}" v-model="${schema.tableName}.new.${prop.name}" required label="${makeLabel(prop.name)}" />
                    </div>`;
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
    <h1>${makeWords(name)}s</h1>

    <div class="surface-card p-4 border-1 surface-border border-round">

        <InputGroup>
            <InputGroupAddon>
                <i class="pi pi-search" />
            </InputGroupAddon>
            <InputText type="text" placeholder="${makeWords(name)}s" class="w-full"
                v-model="${schema.tableName}.query.search" @keydown.enter="${schema.tableName}.search()" />
            <Button label="Search" @click="${schema.tableName}.search()" />
        </InputGroup>

        <DataTable :value="${schema.tableName}.records" stripedRows @sort="(e) => ${schema.tableName}.sortDataTable(e)">
            ${columns(name, schema)}
            <Column header="Manage">
                <template #body="slotProps">
                    <NuxtLink :to="\`/${name.toLowerCase()}/\${slotProps.data.props.id}\`" class="mr-2 no-underline">
                        <Button icon="pi pi-eye"  title="View" alt="View ${makeWords(name)}" />
                    </NuxtLink>
                    <NuxtLink v-if="slotProps.data.meta?.isOwner" :to="\`/${name.toLowerCase()}/\${slotProps.data.props.id}/edit\`" class="mr-2 no-underline">
                        <Button icon="pi pi-pencil" severity="success" title="Edit" alt="Edit ${makeWords(name)}" />
                    </NuxtLink>
                    <Button v-if="slotProps.data.meta?.isOwner"  title="Delete" alt="Delete ${makeWords(name)}" icon="pi pi-trash" severity="danger" @click="slotProps.data.delete()" />
                </template>
            </Column>
        </DataTable>
        <Pager :kind="${schema.tableName}" />
    </div>
    <div class="mt-5 surface-card p-5 border-1 surface-border border-round">
        <h2 class="mt-0">Create ${makeWords(name)}</h2>

        <Form :send="() => ${schema.tableName}.create()">
            <div class="flex gap-5 flex-column-reverse md:flex-row">
                <div class="flex-auto p-fluid">
                    ${createProps(schema)}
                    <div>
                        <Button type="submit" class="w-auto" severity="success">
                        <i class="pi pi-plus mr-1"></i> Create ${makeWords(name)}
                        </Button>
                    </div>
                </div>

            </div>
        </Form>
    </div>
</template>

<script setup>
const dt = useDateTime();
const ${schema.tableName} = useVingKind({
    listApi: \`/api/\${restVersion()}/${name.toLowerCase()}\`,
    createApi: \`/api/\${restVersion()}/${name.toLowerCase()}\`,
    query: { includeMeta: true, sortBy: 'createdAt', sortOrder: 'desc' ${includeRelatedTemplate(schema)} },
    newDefaults: { ${newDefaults(schema)} },
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
            <div><b>${makeLabel(prop.name)}</b>: {{dt.formatDateTime(${schema.kind.toLowerCase()}.props?.${prop.name})}}</div>
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
                <Image size="100" :src="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.meta?.thumbnailUrl" alt="thumbnail" :title="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.props?.filename + ' thumbnail'">
                    <template v-if="['png','jpg','gif'].includes(${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.props?.extension)" #image>
                        <img :src="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.meta?.fileUrl" alt="file" :title="${schema.kind.toLowerCase()}.related?.${prop.relation?.name}?.props?.filename + ' full size image'" />
                    </template>
                </Image>
            </div>
            `;
            }
            else if (prop.type == 'id') {
                out += `
            <div><b>${makeLabel(prop.name)}</b>: {{${schema.kind.toLowerCase()}.props?.${prop.name}}} <CopyToClipboard :text="${schema.kind.toLowerCase()}.props?.${prop.name}" /></div>
            `;
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
            if (prop.relation?.kind == 'S3File') {
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
    <Crumbtrail :crumbs="breadcrumbs" />
    <h1>{{${name.toLowerCase()}.props?.${nameOrId(schema)}}}</h1>
    <div v-if="${name.toLowerCase()}.props?.id" class="surface-card p-4 border-1 surface-border border-round flex-auto">
        ${viewProps(schema)}
    </div>
    <div class="mt-3" v-if="${name.toLowerCase()}.meta?.isOwner">
        <NuxtLink :to="\`/${name.toLowerCase()}/\${${name.toLowerCase()}.props?.id}/edit\`" class="no-underline mr-2 mb-2">
            <Button severity="success" title="Edit" alt="Edit ${makeWords(name)}"><i class="pi pi-pencil mr-1"></i> Edit</Button>
        </NuxtLink>
        <Button @click="${name.toLowerCase()}.delete()" severity="danger" title="Delete" alt="Delete ${makeWords(name)}"><i class="pi pi-trash mr-1"></i> Delete</Button>
    </div>
</template>
  
<script setup>
const route = useRoute();
const id = route.params.id.toString();
const ${name.toLowerCase()} = useVingRecord({
    id,
    fetchApi: \`/api/\${restVersion()}/${name.toLowerCase()}/\${id}\`,
    query: { includeMeta: true, includeOptions: true ${includeRelatedTemplate(schema)} },
    async onDelete() {
        await navigateTo('/${name.toLowerCase()}');
    },
});
await ${name.toLowerCase()}.fetch();
onBeforeRouteLeave(() => ${name.toLowerCase()}.dispose());
const dt = useDateTime();
const breadcrumbs = [
    { label: '${makeWords(name)}s', to: '/${name.toLowerCase()}' },
    { label: 'View' },
];
</script>`;

const editProps = (schema) => {
    let out = '';
    for (const prop of schema.props) {
        if (prop.edit.length > 0) {
            if (['enum', 'boolean'].includes(prop.type)) {
                out += `
                    <div class="mb-4">
                        <FormInput type="select" name="${prop.name}" :options="${schema.kind.toLowerCase()}.options?.${prop.name}" v-model="${schema.kind.toLowerCase()}.props.${prop.name}" label="${makeLabel(prop.name)}" @change="${schema.kind.toLowerCase()}.update()" />
                    </div>`;
            }
            else if (prop.type == 'id' && prop?.relation?.type == 'parent' && prop.relation?.kind == 'S3File') {
                out += `
                    <div class="mb-4">
                        <client-only>
                            <Dropzone :acceptedFiles="${schema.kind.toLowerCase()}.meta?.acceptedFileExtensions?.${prop?.relation?.name}" :afterUpload="(s3file) => ${schema.kind.toLowerCase()}.importS3File('${prop?.relation?.name}', s3file.props?.id)"
                                :maxFiles="1" :resizeHeight="300" :resizeWidth="300" resizeMethod="crop"></Dropzone>
                        </client-only>
                    </div>`;
            }
            else if (prop.type != 'virtual') {
                out += `
                    <div class="mb-4">
                        <FormInput name="${prop.name}" type="${prop2type(prop)}" v-model="${schema.kind.toLowerCase()}.props.${prop.name}" ${prop.required ? 'required' : ''} label="${makeLabel(prop.name)}" @change="${schema.kind.toLowerCase()}.update()" />
                    </div>`;
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
            <div class="mb-4"><b>${makeLabel(prop.name)}</b>: {{dt.formatDateTime(${schema.kind.toLowerCase()}.props.${prop.name})}}</div>
            `;
            }
            else if (prop.type == 'id') {
                out += `
                <div class="mb-4"><b>${makeLabel(prop.name)}</b>: {{${schema.kind.toLowerCase()}.props?.${prop.name}}} <CopyToClipboard :text="${schema.kind.toLowerCase()}.props?.${prop.name}" size="xs" /></div>
                `;
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
    <Crumbtrail :crumbs="breadcrumbs" />
    <h1>Edit ${makeWords(name)}</h1>

    <FieldsetNav v-if="${name.toLowerCase()}.props">
        <FieldsetItem name="Properties">
            ${editProps(schema)}
        </FieldsetItem>

        <FieldsetItem name="Statistics">
            ${statProps(schema)}
        </FieldsetItem>

        <FieldsetItem name="Actions">
            <NuxtLink :to="\`/${name.toLowerCase()}/\${${name.toLowerCase()}.props?.id}\`" class="no-underline">
                <Button title="View" alt="View ${makeWords(name)}" class="mr-2 mb-2"><i class="pi pi-eye mr-1"></i> View</Button>
            </NuxtLink>
            <Button @click="${name.toLowerCase()}.delete()" severity="danger" class="mr-2 mb-2" title="Delete" alt="Delete ${makeWords(name)}"><i class="pi pi-trash mr-1"></i> Delete</Button>
        </FieldsetItem>

    </FieldsetNav>
</template>
  
<script setup>
definePageMeta({
    middleware: ['auth']
});
const route = useRoute();
const dt = useDateTime();
const notify = useNotifyStore();
const id = route.params.id.toString();
const ${name.toLowerCase()} = useVingRecord({
    id,
    fetchApi: \`/api/\${restVersion()}/${name.toLowerCase()}/\${id}\`,
    createApi: \`/api/\${restVersion()}/${name.toLowerCase()}\`,
    query: { includeMeta: true, includeOptions: true ${includeRelatedTemplate(schema)} },
    onUpdate() {
        notify.success('Updated ${makeWords(name)}.');
    },
    async onDelete() {
        await navigateTo('/${name.toLowerCase()}');
    },
});
await ${name.toLowerCase()}.fetch()
onBeforeRouteLeave(() => ${name.toLowerCase()}.dispose());

const breadcrumbs = [
    { label: '${makeWords(name)}s', to: '/${name.toLowerCase()}' },
    { label: 'View', to: '/${name.toLowerCase()}/'+${name.toLowerCase()}.props.id },
    { label: 'Edit' },
];
</script>`;

export const generateWeb = (params) => {
    const context = { ...getContext({}), ...params };
    return Promise.resolve(context)
        .then(renderTemplate(indexTemplate, toFile(`pages/${context.name.toLowerCase()}/index.vue`)))
        .then(renderTemplate(viewTemplate, toFile(`pages/${context.name.toLowerCase()}/[id]/index.vue`)))
        .then(renderTemplate(editTemplate, toFile(`pages/${context.name.toLowerCase()}/[id]/edit.vue`)))
}

