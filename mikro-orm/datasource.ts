import { EntityManager, EntityRepository, MikroORM, RequestContext } from '@mikro-orm/core';
import { User } from './entities/User.entity';

export const orm = await MikroORM.init();

export const bookRepository = orm.em.getRepository(User);