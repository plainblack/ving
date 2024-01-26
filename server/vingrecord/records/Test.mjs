import { VingRecord, VingKind } from "../VingRecord.mjs";
import { useDB } from '../../drizzle/db.mjs';
import { TestTable } from '../../drizzle/schema/Test.mjs';
import { useUsers } from './User.mjs';


export class TestRecord extends VingRecord {
    // add custom Record code here
    
    // User - parent relationship
    get user() {
        return useUsers().findOrDie(this.get('userId'));
    }

}

export class TestKind extends VingKind  {
    // add custom Kind code here
}

export const useTests = () => {
    return new TestKind(useDB(), TestTable, TestRecord);
}