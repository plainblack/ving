<template>
    <div class="flex">
        <div class="md:grow">
            <slot></slot>
        </div>
        <div class="md:hidden lg:block ml-5">
            <ul class="list-none sticky m-0 p-0 pt-4 top-0">
                <li class="mb-2" v-for="child in sortedChildren()" :key="child.id">
                    <a :href="`#${child.id}`">
                        {{ child.name }}
                    </a>
                </li>
            </ul>
        </div>
    </div>
</template>

<script setup>

let children = ref({});

const sortedChildren = () => {
    let out = [];
    for (const name of Object.keys(children.value)) {
        out.push({
            id: children.value[name],
            name: name,
        })
    }
    return out;
}

provide('register', function (name, id) {
    children.value[name] = id;
});

provide('unregister', function (name) {
    delete children.value[name];
});

</script>