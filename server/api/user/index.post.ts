import { User } from '../../../typeorm/entity/User';
import { vingDescribe, vingBody } from '../../helpers';
export default defineEventHandler(async (event) => {
  const user = await User.createAndVerify<'User'>(await vingBody(event));
  return user.describe(vingDescribe(event));
});