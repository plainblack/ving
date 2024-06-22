export const useRestVersion = () => {
    const config = useRuntimeConfig();
    return config.public.rest.version;
}