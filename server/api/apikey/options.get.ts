import { useAPIKeys } from '../../vingrecord/records/APIKey.mjs';
import { describeParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    return APIKeys.mint().propOptions(describeParams(event), true);
});