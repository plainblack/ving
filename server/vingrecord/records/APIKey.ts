import { useVingKind, useVingRecord, VingRecord, useVingRecordOptions, useVingKindOptions } from "../VingRecord";
import { db } from '../../drizzle/db';
import { APIKeyTable } from '../../drizzle/schema/APIKey';


export interface APIKeyRecord extends VingRecord<'APIKey'> {
}


export function useAPIKeyRecord(
    { db, table, props, inserted = true }:
        useVingRecordOptions<'APIKey'>
) {
    const base = useVingRecord<'APIKey'>({ db, table, props, inserted });

    const APIKeyRecord: APIKeyRecord = {
        ...base,
    }

    return APIKeyRecord;
}

export function useAPIKeyKind<R extends typeof useAPIKeyRecord>({ db, table, recordComposable, propDefaults = {} }: useVingKindOptions<'APIKey', APIKeyRecord>) {
    const base = useVingKind<'APIKey', APIKeyRecord>({ db, table, recordComposable, propDefaults });
    return {
        ...base
    }
}

export const APIKeys = useAPIKeyKind({ db, table: APIKeyTable, recordComposable: useAPIKeyRecord, propDefaults: {} });