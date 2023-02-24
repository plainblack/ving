import { Users } from '~/utils/db';
import { vingDescribe, vingBody } from '~~/utils/helpers';
export default defineEventHandler(async (event) => {
  const user = await Users.createAndVerify(await vingBody(event));
  return user.describe(vingDescribe(event));
});