import type { Describe, DescribeList, ModelName, VingRecord, VingRecordParams, QueryParams } from '~/types';
import { ouch } from '~/server/helpers';
import _ from 'lodash';
const notify = useNotifyStore();

export type VingRecordListParams<T extends ModelName> = {
    newDefaults?: Describe<T>['props'],
    createApi?: string | undefined,
    listApi?: string | undefined,
    // postFormattingOptions: {}
}

export interface VingRecordList<T extends ModelName> {
    behavior: VingRecordListParams<T>,
    query: QueryParams,
    objects: VingRecord<T>[],
    paging: DescribeList<T>['paging'],
    new: Partial<Describe<T>['props']>,
}

export default <T extends ModelName>(behavior: VingRecordListParams<T> = {}) => {

    const VingRecordList: VingRecordList<T> = {

        behavior: {},
        query: {},
        objects: [],
        paging: {
            page: 1,
            nextPage: 1,
            previousPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
        },
        new: _.defaultsDeep({}, behavior.newDefaults)

    }

    VingRecordList.behavior = behavior;

    return VingRecordList;
}