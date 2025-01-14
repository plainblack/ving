/**
 * Creates a data structure for the admin naivigation links.
 * @returns {object[]} An array of objects to be used with the PanelNav component.
 * @example
 * useAdminLinks()
 */

export default () => {
    const links = computed(() => {
        const out = [
            { label: 'Cron Jobs', to: '/cronjobs', icon: 'ph:clock' },
            { label: 'System Wide Alert', to: '/system-wide-alert', icon: 'ph:megaphone' },
            { label: 'Users', to: '/users/admin', icon: 'ph:users' },
        ];
        return out;
    });
    return links;
}