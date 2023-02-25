import { Users } from '~~/app/db';
import { vingDescribeList, vingSession, ouch } from '~~/app/helpers';
export default defineEventHandler(async (event) => {
  const session = vingSession(event);
  // comment the 2 lines below out if you want to allow mere users to access the user list
  if (session === undefined || !session.isRole('admin'))
    throw ouch(403, 'You must be an admin to do that.');
  return await Users.describeList(vingDescribeList(event));
})
