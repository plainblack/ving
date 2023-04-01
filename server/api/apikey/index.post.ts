import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { vingDescribe, vingBody, vingSession } from '../../helpers';
export default defineEventHandler(async (event) => {
  const APIKeys = useAPIKeys();
  const apikey = await APIKeys.createAndVerify(await vingBody(event), vingSession(event));
  return apikey.describe(vingDescribe(event));
});