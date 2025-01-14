<template>
    <Title>Edit {{cronjob.props?.id}}</Title>
    <PanelFrame :title="'Edit '+cronjob.props?.id" section="Cron Jobs">
        <template #left>
            <PanelNav :links="links" />
        </template>
        <template #content>
            <FieldsetNav v-if="cronjob.props">
                <FieldsetItem name="Properties">
                    
                    <FormInput name="schedule" type="text" v-model="cronjob.props.schedule" required label="Schedule" @change="cronjob.save('schedule')" class="mb-4" />
                    <FormInput name="handler" type="select" :options="cronjob.options?.handler" v-model="cronjob.props.handler" required label="Handler" @change="cronjob.save('handler')" class="mb-4" />
                    <FormInput name="params" type="textarea" v-model="computedParams"  label="Params" @change="cronjob.save('params')" class="mb-4" />
                    <FormInput name="enabled" type="select" :options="cronjob.options?.enabled" v-model="cronjob.props.enabled" label="Enabled" @change="cronjob.save('enabled')" class="mb-4" />
                    <FormInput name="note" type="textarea" v-model="cronjob.props.note"  label="Note" @change="cronjob.save('note')" class="mb-4" />
                </FieldsetItem>

                <FieldsetItem name="Statistics">
                    
                <div class="mb-4"><b>Id</b>: {{cronjob.props?.id}} <CopyToClipboard :text="cronjob.props?.id" size="xs" /></div>
                
            <div class="mb-4"><b>Created At</b>: {{formatDateTime(cronjob.props.createdAt)}}</div>
            
            <div class="mb-4"><b>Updated At</b>: {{formatDateTime(cronjob.props.updatedAt)}}</div>
            
                </FieldsetItem>

                <FieldsetItem name="Actions">
                    <Button @mousedown="cronjob.delete()" severity="danger" class="mr-2 mb-2" title="Delete" alt="Delete Cron Job"><Icon name="ph:trash" class="mr-1"/> Delete</Button>
                </FieldsetItem>
            </FieldsetNav>
        </template>
    </PanelFrame>
</template>
  
<script setup>
definePageMeta({
    middleware: ['auth', 'admin']
});
const route = useRoute();
const notify = useNotify();
const id = route.params.id.toString();
const cronjob = useVingRecord({
    id,
    fetchApi: `/api/${useRestVersion()}/cronjobs/${id}`,
    createApi: `/api/${useRestVersion()}/cronjobs`,
    query: { includeMeta: true, includeOptions: true  },
    onUpdate() {
        notify.success('Updated Cron Job.');
    },
    async onDelete() {
       await navigateTo(cronjob.links.list.href);
    },
});
await cronjob.fetch()
const computedParams = computed({
        get() {
            return JSON.stringify(cronjob.props.params);
        },
         set(value) {
            cronjob.props.params = JSON.parse(value);
        }
});
onBeforeRouteLeave(() => cronjob.dispose());
const links = useAdminLinks();

</script>