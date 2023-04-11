import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { describeListParams } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    return await APIKeys.describeList(describeListParams(event));
});