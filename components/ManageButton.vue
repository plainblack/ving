<template>
    <Button v-if="items.length == 1 && firstItem.action" @click="firstItem.action" :severity="severity">
        <Icon :name="firstItem.icon" class="mr-2" />
        {{ firstItem.label }}
    </Button>
    <NuxtLink v-else-if="items.length == 1 && firstItem.to" :to="firstItem.to" v-ripple class="flex no-underline align-items-center">
        <Button :severity="severity">
            <Icon :name="firstItem.icon" class="mr-2" />
            {{ firstItem.label }}
        </Button>
    </NuxtLink>
    <SplitButton v-else-if="items.length > 1" :severity="severity" :model="otherItems" @click="firstItem.action">
        <span v-if="firstItem.action" >
            <Icon :name="firstItem.icon" :title="firstItem.label" class="mr-2" />
            {{ firstItem.label }}
        </span>
        <NuxtLink v-else :to="firstItem.to" v-ripple class="flex no-underline text-white align-items-center" :title="firstItem.label">
            <Icon :name="firstItem.icon" class="mr-2" />
            {{ firstItem.label }}
        </NuxtLink>
        <template #item="{ item }">
            <span v-if="item.action" @click="item.action" class="flex p-2 align-items-center" :title="item.label">
                <Icon :name="item.icon" class="mr-2" />
                {{ item.label }}
            </span>
            <NuxtLink v-else :to="item.to" v-ripple class="flex p-2 align-items-center" :title="item.label">
                <Icon :name="item.icon" class="mr-2" />
                    {{ item.label }}
            </NuxtLink>
        </template>
    </SplitButton>
    <Message v-else severity="error">You need to specify some items.</Message>
</template>

<script setup>
    const props = defineProps({
        severity: String,
        items: {
            type: Array,
            required: true,
        },
    });
    const firstItem = computed(() => props.items[0] || {});
    const otherItems = computed(() => props.items.filter((e, i) => i != 0) || []);
</script>