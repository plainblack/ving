import { VingRecord, VingKind } from "../VingRecord";
import { useDB } from '../../drizzle/db';
import { APIKeyTable } from '../../drizzle/schema/APIKey';
import { useUsers } from './User'

export class APIKeyRecord extends VingRecord<'APIKey'> {
    // add custom Record code here

    public get user() {
        return useUsers().findOrDie(this.get('userId'));
    }

}

export class APIKeyKind extends VingKind<'APIKey', APIKeyRecord>  {
    // add custom Kind code here

    public describeListFilter() {
        const filter = super.describeListFilter();
        filter.queryable.push(this.table.name);
        return filter;
    }

}

export const useAPIKeys = () => {
    return new APIKeyKind(useDB(), APIKeyTable, APIKeyRecord);
}