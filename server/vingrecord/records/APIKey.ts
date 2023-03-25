import { VingRecord, VingKind } from "../VingRecord";
import { useDB } from '../../drizzle/db';
import { APIKeyTable } from '../../drizzle/schema/APIKey';


export class APIKeyRecord extends VingRecord<'APIKey'> {
    // add custom Record code here

    //  public get user(): any {
    //    return Users.findUnique({ where: { id: this.get('userId') } });
    //}
}

export class APIKeyKind extends VingKind<'APIKey', APIKeyRecord>  {
    // add custom Kind code here
}


let APIKeys: any = undefined;

export const useAPIKeys = () => {
    if (APIKeys) {
        return APIKeys
    }
    return APIKeys = new APIKeyKind(useDB(), APIKeyTable, APIKeyRecord);
}

APIKeys = useAPIKeys();