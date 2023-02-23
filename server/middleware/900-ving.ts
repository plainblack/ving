export default defineEventHandler((event) => {
    if (event.path !== undefined && event.path.match(/^\/api\//)) {
        event.context.ving = {};
    }
})