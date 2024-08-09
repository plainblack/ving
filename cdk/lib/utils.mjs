import { usernameSync } from 'username';
import { miniHash } from '../../ving/utils/miniHash.mjs';
import constants from '../lib/constants.mjs';

export function generatePrefix(stage) {
    return `${constants.shortName}-${stage}`;
}

export function generateSuffix(stage) {
    return stage == 'dev' ? miniHash(usernameSync()) : '';
}