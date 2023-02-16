import { PrismaClient } from "@prisma/client";
import { VingKind, VingRecord, TProps } from "./Base";
import Users from "./Users";
import crypto from 'crypto';

export class APIKey extends VingRecord<'APIKey'> {

    public get user(): any {
        return Users.findUnique({ where: { id: this.props.userId } });
    }

}

export class APIKeys extends VingKind<'APIKey', APIKey>  {

    public mint(props: TProps<'APIKey'>) {
        const obj = super.mint(props);
        obj.props.privateKey = 'pk_' + crypto.randomUUID();
        return obj;
    }
}

export default new APIKeys(new PrismaClient().aPIKey, APIKey);
