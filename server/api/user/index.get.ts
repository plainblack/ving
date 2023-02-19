export default defineEventHandler(async (event) => {
  //const query = getQuery(event);
  //	return useFoo();
  //  const users = await db.Users.findMany()
  //  return await db.Users.findUnique({ where: { email: 'andy@shawshank.jail' } });
  //users[0].test();
  //prisma.test();
  //prisma.user.test();
  // users[0].boop();
  // return Object.getPrototypeOf(users[0])
  //return users[0].isOwner(users[1])
  return await db.Users.describeList();
  //return { foo : 1}
})
