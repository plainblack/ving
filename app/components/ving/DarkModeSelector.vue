<template>
    <div class="card flex justify-center">
        <a class="flex  p-3 cursor-pointer" @click="toggle">
            <Icon v-if="isDark" name="circum:dark" />
            <Icon v-else name="circum:light" />
        </a>

        <Popover ref="op">
            <Menu :model="[
                {label : 'Dark Mode', icon: 'circum:dark', value : true},
                {label : 'Light Mode', icon: 'circum:light', value: false},
                ]">
                <template #item="{ item, props, hasSubmenu, root }">
                    <div @mousedown="isDark = item.value; toggle()" class="flex  p-2  cursor-pointer">
                        <Icon :name="item.icon" class="mr-2" />
                        <span>{{ item.label }}</span>
                    </div>
                </template>
            </Menu>
        </Popover>
    </div>
</template>


<script setup>
const op = ref();
const toggle = (event) => {
    op.value.toggle(event);
}
const isDark = useDark();
</script>