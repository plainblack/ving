import { AppDataSource } from '../../typeorm/data-source';
import { User } from '../../typeorm/entity/User'
export default defineEventHandler(async (event) => {
    const user = new User()
    user.setAll({
        username: 'foo4',
        email: 'foo4@foo.foo',
        realName: 'foo'
    });
    await user.save();
    user.set('admin', true);
    await user.save();
    //  await AppDataSource.manager.save(user)
    //await AppDataSource.manager.find(User)
    // return await User.find()

    return user.getAll() || 'nope';
})
