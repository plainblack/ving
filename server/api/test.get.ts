import { AppDataSource } from '../../typeorm/data-source';
import { User } from '../../typeorm/entity/User'
export default defineEventHandler(async (event) => {
    const user = new User()

    //  await AppDataSource.manager.save(user)
    //await AppDataSource.manager.find(User)
    // return await User.find()

    return Object.keys(user.useAsDisplayName = 'email') || 'nope';
})
