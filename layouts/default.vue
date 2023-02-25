<template>
    <client-only>
        <el-menu :default-active="activeIndex" mode="horizontal" :router="true">
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <el-menu-item index="/">Ving</el-menu-item>
            <div class="flex-grow" />
            <el-menu-item index="/user/login">
                <el-icon><i class="fa-regular fa-circle-user"></i></el-icon>
                <template #title>Account</template>
            </el-menu-item>
        </el-menu>
    </client-only>
    <el-container>
        <el-header>
        </el-header>
        <el-main class="border">
            <slot />
        </el-main>
        <el-footer>
            Footer stuff goes here
        </el-footer>
    </el-container>
</template>

<script setup lang="ts">
import { ref } from 'vue'

const activeIndex = ref('1');

</script>

<style>
.flex-grow {
    flex-grow: 1;
}
</style>