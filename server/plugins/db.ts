import sequelize from '~/sequelize/client';
export default defineNitroPlugin(async (nitro) => {
    try {
        await sequelize.authenticate();
    } catch (error) {
        console.log(error);
    }
});