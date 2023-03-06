import user from '~~/sequelize/models/user';

export default defineEventHandler(async (event) => {
    return user;
});
