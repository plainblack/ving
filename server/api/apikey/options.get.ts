import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { vingDescribe } from '../../helpers';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    return APIKeys.mint().propOptions(vingDescribe(event), true);
})
