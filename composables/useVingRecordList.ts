import type { Describe, DescribeList, DescribeListParams, ModelName, VingRecord, VingRecordParams, QueryParams } from '~/types';
import { ouch } from '~/server/helpers';
import _ from 'lodash';
const notify = useNotifyStore();

export type VingRecordListParams<T extends ModelName> = {
    newDefaults?: Describe<T>['props'],
    createApi?: string | undefined,
    listApi?: string | undefined,
    query?: DescribeListParams,
    onSuccess?: (result: DescribeList<T>) => void,
    onEach?: (result: Describe<T>, record: VingRecord<T>) => void
    onCreate?: (result: Describe<T>, record: VingRecord<T>) => void
    onUpdate?: (result: Describe<T>, record: VingRecord<T>) => void
    onDelete?: (result: Describe<T>, record: VingRecordList<T>) => void
}

type VRLSearchOptions<T extends ModelName> = {
    query?: DescribeListParams,
    accumulate?: boolean,
    unshift?: boolean,
    onSuccess?: (result: DescribeList<T>) => void
    onEach?: (result: Describe<T>, record: VingRecord<T>) => void
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
    findIndex(id: VingRecord<T>['props']['id']): number,
    find(id: VingRecord<T>['props']['id']): VingRecord<T>,
    mint(params: Describe<T>): VingRecord<T>,
    append(record: Describe<T>, options: VRLSearchOptions<T>): VingRecord<T>,
    getListApi(): string,
    getCreateApi(): string,
    search(options?: VRLSearchOptions<T>): Promise<any>,
    searchFast(options?: VRLSearchOptions<T>): Promise<any>,
    _search(options?: VRLSearchOptions<T>): Promise<any>,
    remove(id: Describe<T>['props']['id']): void,
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

        findIndex(id) {
            return this.records.findIndex((obj: VingRecord<T>) => obj.props.id == id);
        },

        find(id) {
            const index = this.findIndex(id);
            if (index >= 0) {
                return this.records[index];
            }
            else {
                throw ouch(404, `cannot find "${id}" in record list`);
            }
        },

        mint(params) {
            const self = this;
            return useVingRecord({
                ...params,
                createApi: self.createApi,
                onCreate: behavior.onCreate,
                onUpdate: behavior.onUpdate,
                onDelete(params) {
                    const myself = this;
                    self.paging.totalItems--;
                    if (behavior.onDelete)
                        behavior.onDelete(params, self);
                    self.remove(params.props.id)
                },
            });
        },

        append(record, options) {
            const self = this;
            const newRecord = self.mint(record);
            self.records.push(newRecord);
            if (options.onEach) {
                options.onEach(record, self.records[self.records.length - 1]);
            }
            if (behavior.onEach) {
                behavior.onEach(record, self.records[self.records.length - 1]);
            }
            return newRecord;
        },

        getListApi() {
            if (this.behavior.listApi) {
                return this.behavior.listApi;
            }
            notify.error('No listApi');
            throw ouch(401, 'No listApi');
        },

        getCreateApi() {
            if (this.behavior.createApi) {
                return this.behavior.createApi;
            }
            notify.error('No createApi');
            throw ouch(401, 'No createApi');
        },

        search: _.debounce(function (options) {
            // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
            return this._search(options);
        }, 500),

        searchFast: _.debounce(function (options) {
            // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
            return this._search(options);
        }, 200),

        _search: function (options = {}) {
            const self = this;
            if (!self.listApi) {
                console.error("record list listApi is empty");
            }
            let pagination = {
                page: options?.query?.page || self.paging.page || 1,
                itemsPerPage: options?.query?.itemsPerPage || self.paging.itemsPerPage || 10,
            };
            const query = _.extend({}, pagination, options.query, self.query);

            const promise = useFetch(this.getListApi(), {
                query: query,
            });
            promise.then((response) => {
                const data: DescribeList<T> = response.data.value as DescribeList<T>;

                if (options.accumulate != true) {
                    self.records = [];
                }
                for (var index = 0; index < data.items.length; index++) {
                    self.append(data.items[index], options);
                }
                self.paging = data.paging;
                const items = data.items;
                if (options?.onSuccess) {
                    options?.onSuccess(data);
                }
                if (behavior.onSuccess) {
                    behavior.onSuccess(data);
                }
                return items;
            })
                .catch((response) => {
                    throw response;
                });

            return promise;
        },

        remove: function (id) {
            const self = this;
            const index = self.findIndex(id);
            if (index >= 0) {
                self.records.splice(index, 1);
            }
        },
    }

    return VingRecordList;
}