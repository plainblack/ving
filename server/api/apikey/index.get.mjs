import { useAPIKeys } from '../../vingrecord/records/APIKey.mjs';
import { describeListParams, describeListWhere } from '../../utils/rest.mjs';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    return await APIKeys.describeList(describeListParams(event), describeListWhere(event, APIKeys.describeListFilter()));
});