import { VingRecord, VingKind } from "../VingRecord.mjs";
import { useDB } from '../../drizzle/db.mjs';
import { APIKeyTable } from '../../drizzle/schema/APIKey.mjs';
import { useUsers } from './User.mjs'

export class APIKeyRecord extends VingRecord {
    // add custom Record code here

    get user() {
        return useUsers().findOrDie(this.get('userId'));
    }

}

export class APIKeyKind extends VingKind {
    // add custom Kind code here
}

export const useAPIKeys = () => {
    return new APIKeyKind(useDB(), APIKeyTable, APIKeyRecord);
}