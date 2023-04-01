import { useAPIKeys } from '../../vingrecord/records/APIKey';
import { vingDescribeList, vingSession, ouch } from '../../helpers';
export default defineEventHandler(async (event) => {
  const APIKeys = useAPIKeys();
  return await APIKeys.describeList(vingDescribeList(event));
})
