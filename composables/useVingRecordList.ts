import type { VingRecordList, VingRecordListParams, DescribeList, ModelName } from '~/types';
import { ouch } from '~/server/helpers';
import _ from 'lodash';
const notify = useNotifyStore();

export default <T extends ModelName>(behavior: VingRecordListParams<T> = {}) => {

    const throbber = useThrobberStore();

    const onRequest = async (context: any) => {
        throbber.working();
    }

    const onRequestError = async (context: any) => {
        throbber.done();
    }

    const onResponse = async (context: any) => {
        throbber.done();
    }

    const onResponseError = async (context: any) => {
        throbber.done();
        console.dir(context)
        if (!behavior.suppressErrorNotifications)
            notify.error(context.response._data.message);
    }

    const VingRecordList: VingRecordList<T> = {

        behavior,

        query: _.defaultsDeep({}, { includeLinks: true }, behavior.query),

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
            return this.records.findIndex((obj) => obj.props.id == id);
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
                onDelete(params, record) {
                    self.paging.totalItems--;
                    if (behavior.onDelete)
                        behavior.onDelete(params, record);
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
            let pagination = {
                page: options?.page || self.paging.page || 1,
                itemsPerPage: self.paging.itemsPerPage || 10,
            };
            const query = _.extend({}, pagination, options.query, self.query);

            const promise = useFetch(this.getListApi(), {
                query: query,
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
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
                if (options?.onSearch)
                    options?.onSearch(data);
                if (behavior.onSearch)
                    behavior.onSearch(data);
                return items;
            })
            return promise;
        },

        all: _.debounce(function (options, page) {
            // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
            return this._all(options, page);
        }, 200),

        _all(options = {}, iterations = 1) {
            let self = this;
            return new Promise((resolve, reject) =>
                self
                    ._search({
                        ...options,
                        accumulate: true,
                        page: iterations,
                    })
                    .then(() => {
                        if (self.paging.page < self.paging.totalPages) {
                            if (iterations < 999) {
                                self
                                    ._all(options, iterations + 1)
                                    .then(resolve)
                                    .catch(reject);
                            } else {
                                const message = "infinite loop detected in _all() for " + self.getListApi()
                                notify.error(message);
                                throw ouch(400, message);
                            }
                        } else {
                            if (options.onAllDone)
                                options.onAllDone();
                            if (behavior.onAllDone)
                                behavior.onAllDone();
                            resolve(undefined);
                        }
                    })
                    .catch(reject)
            );
        },

        reset() {
            const self = this;
            self.records = [];
            return self;
        },

        call(method, url, query = {}, options = {}) {
            const self = this;
            const promise = useFetch(url, {
                query: _.extend({}, self.query, query),
                method,
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
            });
            promise.then((response) => {
                const data: DescribeList<T> = response.data.value as DescribeList<T>;
                if (options?.onSuccess) {
                    options?.onSuccess(data);
                }
            })
                .catch((response) => {
                    const data: DescribeList<T> = response.data.value as DescribeList<T>;
                    if (options?.onError) {
                        options?.onError(data);
                    }
                });
            return promise;
        },

        getFieldOptionsApi: function () {
            const self = this;
            if (behavior.optionsApi != null) {
                return behavior.optionsApi;
            }
            return self.getCreateApi + "/options";
        },

        fetchFieldOptions(options = {}) {
            const self = this;
            const promise = useFetch(self.getFieldOptionsApi, {
                onRequest,
                onRequestError,
                onResponse,
                onResponseError,
            });
            promise.then((response) => {
                const data: DescribeList<T> = response.data.value as DescribeList<T>;
                if (options?.onSuccess) {
                    options?.onSuccess(data);
                }
            })
                .catch((response) => {
                    const data: DescribeList<T> = response.data.value as DescribeList<T>;
                    if (options?.onError) {
                        options?.onError(data);
                    }
                });
            return promise;
        },

        create(props = {}, options = {}) {
            const self = this;
            const newProps = _.extend({}, self.new, props);
            const newRecord = self.mint({ props: newProps });
            const addIt = function () {
                if (options?.unshift || behavior?.unshift) {
                    self.records.unshift(newRecord);
                } else {
                    self.records.push(newRecord);
                }
                self.paging.totalItems++;
                self.resetNew();
            };
            if (options.onCreate) {
                const success = options.onCreate;
                options.onCreate = function (properties, record) {
                    addIt();
                    success(properties, record);
                };
            } else {
                options.onCreate = addIt;
            }
            return newRecord.create(newProps, { onCreate: options.onCreate, onError: options.onError });
        },

        update: function (index, options) {
            return this.records[index].update(options);
        },

        save: function (index, property) {
            return this.records[index].save(property);
        },

        partialUpdate: function (index, properties, options) {
            return this.records[index].partialUpdate(properties, options);
        },

        delete: function (index, options) {
            return this.records[index].delete(options);
        },

        remove: function (id) {
            const index = this.findIndex(id);
            if (index >= 0) {
                this.records.splice(index, 1);
            }
        },
    }

    return VingRecordList;
}