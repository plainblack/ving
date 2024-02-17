import { VingRecord, VingKind } from "#ving/record/VingRecord.mjs";
import { useDB } from '#ving/drizzle/db.mjs';
import { APIKeyTable } from '#ving/drizzle/schema/APIKey.mjs';
import { useUsers } from '#ving/record/records/User.mjs'

export class APIKeyRecord extends VingRecord {
    // add custom Record code here

    async user() {
        return await useUsers().findOrDie(this.get('userId'));
    }

}

export class APIKeyKind extends VingKind {
    // add custom Kind code here
}

export const useAPIKeys = () => {
    return new APIKeyKind(useDB(), APIKeyTable, APIKeyRecord);
}