import { prisma } from "./client";
import { VingKind, VingRecord, TProps } from "./_Base";
import { Users } from "./Users";
import crypto from 'crypto';

export class APIKeyRecord extends VingRecord<'APIKey'> {

    public get user(): any {
        return Users.findUnique({ where: { id: this.get('userId') } });
    }

}

export class APIKeyKind extends VingKind<'APIKey', APIKeyRecord>  {

    public mint(props: TProps<'APIKey'>) {
        const obj = super.mint(props);
        obj.set('privateKey', 'pk_' + crypto.randomUUID());
        return obj;
    }
}

export const APIKeys = new APIKeyKind(prisma.aPIKey, APIKeyRecord);