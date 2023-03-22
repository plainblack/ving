import type { Describe, ModelName, VingRecord, VingRecordParams } from '~/types';
import { ouch } from '~/server/helpers';
import _ from 'lodash';
const notify = useNotifyStore();

export interface VingRecordList<T extends ModelName> {
    behavior: VingRecordParams<T>,
}

export default <T extends ModelName>(behavior: VingRecordParams<T> = { props: {} }) => {

    const VingRecordList: VingRecordList<T> = {

        behavior: {},

    }

    VingRecordList.behavior = behavior;

    return VingRecordList;
}