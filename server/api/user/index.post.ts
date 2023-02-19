import { db } from '~/utils/db';

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const body = await readBody(event);
  // return body;
  const user = db.Users.mint({});
  user.verifyCreationParams(body);
  user.verifyPostedParams(body);
  user.insert();
  return user.describe({ currentUser: user });
});