import { EntityManager, EntityRepository, MikroORM, RequestContext } from '@mikro-orm/core';
import { User, UserSchema } from './entities/User.entity';

export const orm = await MikroORM.init();

export const userRepository = orm.em.getRepository(User);