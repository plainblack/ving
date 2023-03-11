import { AppDataSource } from '../../typeorm/data-source';
import { User } from '../../typeorm/entity/User'
export default defineEventHandler(async (event) => {
    const user = new User()
    /*user.setAll({
        username: 'foo5',
        email: 'foo5@foo.foo',
        realName: 'foo'
    });
    await user.save();
    user.set('admin', true);
    await user.save();*/
    //  await AppDataSource.manager.save(user)
    //await AppDataSource.manager.find(User)
    // return await User.find()

    return await user.constructor.createQueryBuilder("me").where("me.realName = :realName", { realName: 'foo' }).andWhere(`me.id <> :id`, { id: '78107671-c448-4d6a-b460-9a1c33518472' }).getQueryAndParameters()
        || 'nope';
})
