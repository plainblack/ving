import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { describeListParams, describeListWhere } from '../../utils/rest';
export default defineEventHandler(async (event) => {
    const APIKeys = useAPIKeys();
    return await APIKeys.describeList(describeListParams(event), describeListWhere(event, APIKeys.describeListFilter()));
});