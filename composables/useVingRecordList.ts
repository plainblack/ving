import type { Describe, DescribeList, DescribeListParams, ModelName, VingRecord, VingRecordParams, QueryParams } from '~/types';
import { ouch } from '~/server/helpers';
import _ from 'lodash';
const notify = useNotifyStore();

export type VingRecordListParams<T extends ModelName> = {
    newDefaults?: Describe<T>['props'],
    createApi?: string | undefined,
    listApi?: string | undefined,
    query?: DescribeListParams
    // postFormattingOptions: {}
}

export interface VingRecordList<T extends ModelName> {
    behavior: VingRecordListParams<T>,
    query: QueryParams,
    records: VingRecord<T>[],
    paging: DescribeList<T>['paging'],
    new: Partial<Describe<T>['props']>,
    resetNew(): void,
    listApi: string | undefined,
    createApi: string | undefined,
    propsOptions: Describe<T>['options'],
    itemsPerPageOptions: { value: number, label: string }[],
    findRecordIndex(id: VingRecord<T>['props']['id']): number,
    findRecord(id: VingRecord<T>['props']['id']): VingRecord<T>,
}

export default <T extends ModelName>(behavior: VingRecordListParams<T> = {}) => {

    const VingRecordList: VingRecordList<T> = {

        behavior,
        query: _.defaultsDeep({}, behavior.query),
        records: [],
        paging: {
            page: 1,
            nextPage: 1,
            previousPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
        },
        new: _.defaultsDeep({}, behavior.newDefaults),
        resetNew() {
            this.new = _.defaultsDeep({}, behavior.newDefaults)
        },
        listApi: behavior.listApi,
        createApi: behavior.createApi,
        propsOptions: {},
        itemsPerPageOptions: [
            { value: 5, label: "5 per page" },
            { value: 10, label: "10 per page" },
            { value: 25, label: "25 per page" },
            { value: 50, label: "50 per page" },
            { value: 100, label: "100 per page" },
        ],
        findRecordIndex(id) {
            return this.records.findIndex((obj: VingRecord<T>) => obj.props.id == id);
        },
        findRecord(id) {
            const index = this.findRecordIndex(id);
            if (index >= 0) {
                return this.records[index];
            }
            else {
                throw ouch(404, `cannot find "${id}" in record list`);
            }
        }
    }

    return VingRecordList;
}