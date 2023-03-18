import { User } from '../../../typeorm/entity/User';
import { vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    return new User().propOptions(vingDescribe(event));
})
