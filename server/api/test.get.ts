import { AppDataSource } from '../../typeorm/data-source';
import { User } from '../../typeorm/entity/User'
export default defineEventHandler(async (event) => {
    const user = new User()
    user.firstName = "Timber"
    user.lastName = "Saw"
    user.age = 25
    await AppDataSource.manager.save(user)
    return await AppDataSource.manager.find(User)
})
