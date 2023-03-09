import { MikroORM, Options, EntityManager, EntityRepository } from '@mikro-orm/core';
import { User, UserRepository } from './modules/User';
import config from './config';

export interface Services {
    orm: MikroORM;
    em: EntityManager;
    user: UserRepository;
}

let cache: Services;

export async function initORM(options?: Options): Promise<Services> {
    if (cache) {
        return cache;
    }

    // allow overriding config options for testing
    const orm = await MikroORM.init({
        ...config,
        ...options,
    });

    // save to cache before returning
    return cache = {
        orm,
        em: orm.em,
        user: orm.em.getRepository(User),
    };
}