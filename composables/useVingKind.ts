import type { VKQueryParams, VingRecord, VKSearchOptions, VKAllOptions, VRDeleteOptions, VRUpdateOptions, VingKindParams, VKCreateOptions, VKGenericOptions, Describe, DescribeListParams, DescribeList, ModelName } from '~/types';
import _ from 'lodash';

const notify = useNotifyStore();
class VingKind<T extends ModelName> {

    private state: {
        query: VKQueryParams,
        records: any[],
        paging: DescribeList<T>['paging'],
        new: Partial<Describe<T>['props']>,
        propsOptions: Describe<T>['options'],
    } = reactive({
        query: { includeLinks: true },
        records: [],
        paging: {
            page: 1,
            nextPage: 1,
            previousPage: 1,
            itemsPerPage: 10,
            totalItems: 0,
            totalPages: 0,
        },
        new: {},
        propsOptions: {},
    })

    public get query() {
        return this.state.query;
    }

    public set query(value) {
        this.state.query = value;
    }

    public get records() {
        return this.state.records;
    }

    public set records(value) {
        this.state.records = value;
    }

    public get paging() {
        return this.state.paging;
    }

    public set paging(value) {
        this.state.paging = value;
    }

    public get new() {
        return this.state.new;
    }

    public set new(value) {
        this.state.new = value;
    }

    public get propsOptions() {
        return this.state.propsOptions;
    }

    public set propsOptions(value) {
        this.state.propsOptions = value;
    }

    constructor(private behavior: VingKindParams<T> = {}) {
        this.query = _.defaultsDeep(this.query, this.behavior.query);
        this.resetNew();
    }

    public resetNew() {
        this.new = _.defaultsDeep({}, this.behavior.newDefaults || {});
    }

    public findIndex(id: VingRecord<T>['props']['id']): number {
        return this.records.findIndex((obj) => obj.props.id == id);
    }

    public find(id: VingRecord<T>['props']['id']) {
        const index = this.findIndex(id);
        if (index >= 0) {
            return this.records[index];
        }
        else {
            throw ouch(404, `cannot find "${id}" in record list`);
        }
    }

    public mint(params: Describe<T>) {
        const self = this;
        return useVingRecord<T>({
            ...params,
            createApi: self.getCreateApi(),
            onCreate: self.behavior.onCreate,
            onUpdate: self.behavior.onUpdate,
            onDelete(params) {
                self.paging.totalItems--;
                if (self.behavior.onDelete)
                    self.behavior.onDelete(params);
                self.remove(params.props.id)
            },
        });
    }

    public append(record: Describe<T>, options: VKSearchOptions<T>) {
        const newRecord = this.mint(record);
        this.records.push(newRecord);
        if (options.onEach) {
            options.onEach(record);
        }
        if (this.behavior.onEach) {
            this.behavior.onEach(record);
        }
        return newRecord;
    }

    public getListApi() {
        if (this.behavior.listApi) {
            return this.behavior.listApi;
        }
        notify.error('No listApi');
        throw ouch(401, 'No listApi');
    }

    public getCreateApi() {
        if (this.behavior.createApi) {
            return this.behavior.createApi;
        }
        notify.error('No createApi');
        throw ouch(401, 'No createApi');
    }

    public async sortDataTable(event: any) {
        this.query.sortOrder = event.sortOrder > 0 ? 'asc' : 'desc';
        this.query.sortBy = event.sortField.split('.')[1];
        await this._search();
    }

    public search = () => _.debounce(function (options?: VKSearchOptions<T>) {
        // @ts-expect-error - i think the nature of the construction of this method makes ts think there is a problem when there isn't
        return this._search(options);
    }, 500)

    public searchFast = () => _.debounce(function (options?: VKSearchOptions<T>) {
        // @ts-expect-error - i think the nature of the construction of this method makes ts think there is a problem when there isn't
        return this._search(options);
    }, 200)

    public _search(options: VKSearchOptions<T> = {}) {
        const self = this;
        let pagination = {
            page: options?.page || self.paging.page || 1,
            itemsPerPage: self.paging.itemsPerPage || 10,
        };
        const query = _.extend({}, pagination, options.query, self.query);

        const promise = useHTTP(self.getListApi(), {
            query: query,
            suppressErrorNotifications: self.behavior.suppressErrorNotifications,
        });
        promise.then((response) => {
            const data: DescribeList<T> = response.data.value as DescribeList<T>;

            if (options.accumulate != true) {
                self.reset();
            }
            for (var index = 0; index < data.items.length; index++) {
                self.append(data.items[index], options);
            }
            self.paging = data.paging;
            const items = data.items;
            if (options?.onSearch)
                options?.onSearch(data);
            if (self.behavior.onSearch)
                self.behavior.onSearch(data);
            return items;
        })
        return promise;
    }

    public all = () => _.debounce(function (options?: VKAllOptions<T>, page?: number) {
        // @ts-expect-error - i think the nature of the construction of this method makes ts think there is a problem when there isn't
        return this._all(options, page);
    }, 200)

    public _all(options: VKAllOptions<T> = {}, iterations = 1) {
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
                        if (self.behavior.onAllDone)
                            self.behavior.onAllDone();
                        resolve(undefined);
                    }
                })
                .catch(reject)
        );
    }

    public reset() {
        this.records.splice(0);
        return this;
    }

    public call(method: "post" | "put" | "delete" | "get", url: string, query: DescribeListParams = {}, options: VKGenericOptions<T> = {}) {
        const self = this;
        const promise = useHTTP(url, {
            query: _.extend({}, self.query, query),
            method,
            suppressErrorNotifications: self.behavior.suppressErrorNotifications,
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
    }

    public getPropsOptionsApi() {
        if (this.behavior.optionsApi != null) {
            return this.behavior.optionsApi;
        }
        return this.getCreateApi() + "/options";
    }

    public fetchPropsOptions(options: VKGenericOptions<T> = {}) {
        const self = this;
        const promise = useHTTP(self.getPropsOptionsApi(), {
            suppressErrorNotifications: self.behavior.suppressErrorNotifications,
        });
        promise.then((response) => {
            const data: Describe<T>['options'] = response.data.value as Describe<T>['options'];
            self.propsOptions = data;
            if (options?.onSuccess) {
                options?.onSuccess(data as any);
            }
        })
            .catch((response) => {
                const data: Describe<T>['options'] = response.data.value as Describe<T>['options'];
                if (options?.onError) {
                    options?.onError(data as any);
                }
            });
        return promise;
    }

    public create(props: Describe<T>['props'] = {}, options: VKCreateOptions<T> = {}) {
        const self = this;
        const newProps = _.extend({}, self.new, props);
        const newRecord = self.mint({ props: newProps });
        const addIt = function () {
            if (options?.unshift || self.behavior?.unshift) {
                self.records.unshift(newRecord);
            } else {
                self.records.push(newRecord);
            }
            self.paging.totalItems++;
            self.resetNew();
        };
        if (options.onCreate) {
            const success = options.onCreate;
            options.onCreate = function (properties) {
                addIt();
                success(properties);
            };
        } else {
            options.onCreate = addIt;
        }
        return newRecord.create(newProps, { onCreate: options.onCreate, onError: options.onError });
    }

    public update(index: number, options: VRUpdateOptions<T>) {
        return this.records[index].update(options);
    }

    public save(index: number, prop: keyof Describe<T>['props']) {
        return this.records[index].save(prop);
    }

    public partialUpdate(index: number, props: Describe<T>['props'], options: VRUpdateOptions<T>) {
        return this.records[index].partialUpdate(props, options);
    }

    public delete(index: number, options: VRDeleteOptions<T>) {
        return this.records[index].delete(options);
    }

    public remove(id: Describe<T>['props']['id']) {
        const index = this.findIndex(id);
        if (index >= 0) {
            this.records.splice(index, 1);
        }
    }

}

export const useVingKind = <T extends ModelName>(behavior: VingKindParams<T> = {}) => {
    return new VingKind<T>(behavior);
}