export const restVersion = () => {
    const config = useRuntimeConfig();
    return config.public.rest.version;
}