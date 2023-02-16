//import { db } from 'prisma-ving-client';


export default defineEventHandler(async (event) => {
    const query = getQuery(event);

    //const user = await db.User.create({ data: { username: 'Redd', realName: 'Otis Redding', email: 'redd@shawshank.jail' } })
  //  const user = await db.User.findUnique({ where: { username: 'Redd' } })
  //  user.props.password = 'foot';
  //  user.save();
  //  return { user };
    //return { foo : 1}
})
