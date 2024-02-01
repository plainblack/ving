<template>
    <div class="grid">
        <div class="col-12 md:col-9 xl:col-10">
            <slot></slot>
        </div>
        <div class="hidden md:block md:col-3 xl:col-2">
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