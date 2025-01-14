/**
 * Creates a data structure for the current user's settings naivigation buttons.
 * @returns {object[]} An array of objects to be used with the PanelNav component.
 * @example
 * useUserSettingsButtons()
 */

export default () => {
    const currentUser = useCurrentUser();
    const buttons = computed(() => {
        const out = [
            { label: 'Sign Out', to: '/users/logout', icon: 'ph:door', severity: 'primary' },
        ];
        if (currentUser.props?.admin)
            out.push({ label: 'Admin', to: '/admin', icon: 'ph:users', severity: 'secondary' });
        return out;
    });
    return buttons;
}