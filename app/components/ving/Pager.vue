<template>
    <Paginator :template="{
        '640px': 'PrevPageLink CurrentPageReport NextPageLink',
        '960px': 'FirstPageLink PrevPageLink CurrentPageReport NextPageLink LastPageLink',
        '1300px': 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink',
        default: 'FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink JumpToPageDropdown'
    }" :rowsPerPageOptions="[10, 20, 50, 100]" :alwaysShow="false" :totalRecords="kind.paging.totalItems"
        :rows="kind.paging.itemsPerPage" :pageCount="kind.paging.totalPages" :page="kind.paging.page" @page="changePage">
    </Paginator>
</template>

<script setup>
const props = defineProps(['kind']);

function changePage(page) {
    props.kind.query = {...props.kind.query, page };
    props.kind.search();
}
</script>