/**
 * Use this if you're trying to use useVingKind() with an .all() call and you don't have another middleware that you need to run on that page.
 * @see https://github.com/plainblack/ving/issues/168
 */
export default defineNuxtRouteMiddleware(async () => {
    await $fetch(`/api/v1/test`);
});