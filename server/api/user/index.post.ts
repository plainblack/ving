import { Users } from '~~/app/db';
import { vingDescribe, vingBody } from '~~/app/helpers';
export default defineEventHandler(async (event) => {
  const user = await Users.createAndVerify(await vingBody(event));
  return user.describe(vingDescribe(event));
});