import type { VKQueryParams, VingRecord, VKSearchOptions, VKAllOptions, VRDeleteOptions, VRUpdateOptions, VingKindParams, VKCreateOptions, VKGenericOptions, Describe, DescribeListParams, DescribeList, ModelName } from '~/types';
import _ from 'lodash';
import { debounce } from 'perfect-debounce'

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

    /**
     * The object where new properties are stored awaiting being sent to the server to create the record for real.
     */

    public get new() {
        return this.state.new;
    }

    public set new(value) {
        this.state.new = value;
    }

    /**
     * The object containing paging data.
     */
    public get paging() {
        return this.state.paging;
    }

    public set paging(value) {
        this.state.paging = value;
    }

    /**
     * The object containing enumerated props options once `fetchPropsOptions` is called.
     */
    public get propsOptions() {
        return this.state.propsOptions;
    }

    public set propsOptions(value) {
        this.state.propsOptions = value;
    }

    /**
     * An object containing the query parameters to send when interacting with endpoints for this kind.
     */

    public get query() {
        return this.state.query;
    }

    public set query(value) {
        this.state.query = value;
    }

    /**
     * An array containing the list of records that have been fetched from the server.
     */
    public get records() {
        return this.state.records;
    }

    public set records(value) {
        this.state.records = value;
    }

    /**
     * Constructor.
     * @param behavior An object configuring the endpoints and other info about this kind.
     */

    constructor(private behavior: VingKindParams<T> = {}) {
        this.query = _.defaultsDeep(this.query, this.behavior.query);
        this.resetNew();
    }

    /**
     * Recursively retreieves all the records for the given configuration.
     * 
     * Usage: `await Users.all();`
     * 
     * @param options An object for modifying the the method's functionality.
     * @param iterations For internal use only.
     * @returns A promise that resolves when all the requests have been processed.
     */

    public all(options: VKAllOptions<T> = {}, iterations = 1) {
        let self = this;
        return new Promise((resolve, reject) =>
            self
                .search({
                    ...options,
                    accumulate: true,
                    page: iterations,
                })
                .then(() => {
                    if (self.paging.page < self.paging.totalPages) {
                        if (iterations < 999) {
                            self
                                .all(options, iterations + 1)
                                .then(resolve)
                                .catch(reject);
                        } else {
                            const message = "infinite loop detected in all() for " + self.getListApi()
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


    /**
     * Adds a record to the end of the `records` property. You should never call this method directly unless you know what you're doing.
     * 
     * @param record An object containing a series of other objects that you get back when call the `describe` method of a record server side.
     * @param options Optional.
     * @returns 
     */
    public append(record: Describe<T>, options: VKSearchOptions<T>) {
        const newRecord = this.mint(record);
        newRecord.setState(record); // need to override state with newly fetched data in case its already loaded
        this.records.push(newRecord);
        if (options.onEach) {
            options.onEach(record);
        }
        if (this.behavior.onEach) {
            this.behavior.onEach(record);
        }
        return newRecord;
    }

    /**
     * A quick way to call an endpoint without directly setting up your own `useRest()` composable.
     * 
     * Usage: `const result = Users.call('post', '/user/xxx/send-reset-password', {os:'Windows'});`
     * 
     * @param method `put`, `post`, `get` or `delete`.
     * @param url The endpoint to run this call on.
     * @param query An object containing query parameters to pass to this call.
     * @param options Modify the behavior of this call.
     * @returns A promise containing the response to the call.
     */
    public async call(method: "post" | "put" | "delete" | "get", url: string, query: DescribeListParams = {}, options: VKGenericOptions<T> = {}) {
        const response = await useRest(url, {
            query: _.defaultsDeep({}, this.query, query),
            method,
            suppressErrorNotifications: this.behavior.suppressErrorNotifications,
        });
        if (response.error) {
            if (options?.onError)
                options?.onError(response.error);
        }
        else {
            const data: DescribeList<T> = response.data as DescribeList<T>;
            if (options?.onSuccess)
                options?.onSuccess(data);
        }
        return response;
    }

    /**
     * Creates a new record on the server and appends it to the list of `records`.
     * 
     * Usage: `await Users.create()`
     * 
     * @param props A list of props for this kind.
     * @param options An object that changes the behavior of this method.
     * @returns A promise containing the response.
     */
    public create(props: Describe<T>['props'] = {}, options: VKCreateOptions<T> = {}) {
        const self = this;
        const newProps = _.defaultsDeep({}, self.new, props);
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

    /**
     * Removes a record from the server and the local list of `records`.
     * 
     * Usage: `await Users.delete(0)`
     * 
     * @param index An index on the `records` list you wish to delete.
     * @param options An object to change the behavior of this method.
     * @returns A promise that contains the response.
     */

    public delete(index: number, options: VRDeleteOptions<T>) {
        return this.records[index].delete(options);
    }

    /**
     * Fetches the list of enum options for this kind, which can be helpful when creating a new record.
     * 
     * Usage: `await Users.fetchPropsOptions()`
     * 
     * @param options An object that changes the behavior of this method.
     * @returns A promise that contains the response.
     */
    public async fetchPropsOptions(options: VKGenericOptions<T> = {}) {
        const response = await useRest(this.getPropsOptionsApi(), {
            suppressErrorNotifications: this.behavior.suppressErrorNotifications,
        });
        if (response.error) {
            if (options?.onError)
                options?.onError(response.error);
        }
        else {
            const data: Describe<T>['options'] = response.data as Describe<T>['options'];
            if (options?.onSuccess)
                options?.onSuccess(data as any);
        }
        return response;
    }

    /**
     * Returns a specific record by id from the list of local `records`.
     * 
     * Usage: `const user = Users.find('xxx');`
     * 
     * @param id The unique id of a record on the `records` list that you which to get a reference to.
     * @returns A record.
     */
    public find(id: VingRecord<T>['props']['id']) {
        const index = this.findIndex(id);
        if (index >= 0) {
            return this.records[index];
        }
        else {
            throw ouch(404, `cannot find "${id}" in record list`);
        }
    }


    /**
     * Returns the index of a specific record in the local `records` list.
     * 
     * Usage: `const idx = Users.findIndex(id);`
     * 
     * @param id The unique id of the record.
     * @returns A record array index.
     */
    public findIndex(id: VingRecord<T>['props']['id']): number {
        return this.records.findIndex((obj) => obj.props.id == id);
    }

    /**
     * Returns the configured endpoint for creating records of this kind or throws an error if it cannot.
     * 
     * Usage: `const url = Users.getCreateApi()`
     * @returns An endpoint url
     */
    public getCreateApi() {
        if (this.behavior.createApi) {
            return this.behavior.createApi;
        }
        notify.error('No createApi');
        throw ouch(401, 'No createApi');
    }

    /**
     * Returns the configured endpoint for fetching the list of records of this kind or throws an error if it cannot.
     * 
     * Usage: `const url = Users.getListApi()`
     * 
     * @returns An endpoint url
     */
    public getListApi() {
        if (this.behavior.listApi) {
            return this.behavior.listApi;
        }
        notify.error('No listApi');
        throw ouch(401, 'No listApi');
    }

    /**
     * Returns the configured endpoint for fetching the enumerated props options for this kind or throws an error if it cannot.
     * 
     * Usage: `const url = Users.getPropsOptionsApi()`
     * 
     * @returns An endpoint url
     */
    public getPropsOptionsApi() {
        if (this.behavior.optionsApi != null) {
            return this.behavior.optionsApi;
        }
        return this.getCreateApi() + "/options";
    }

    /**
     * Creates a local record in the `records` list without creating it on the server.
     * 
     * Usage: `const newRecord = Users.mind({props : 'username'})`
     * 
     * @param params A describe object for the user that must at minimum have a list of props you want to use for the user
     * @returns A newly minted record.
     */
    public mint(params: Describe<T>) {
        const self = this;
        return useVingRecord<T>({
            ...params,
            createApi: self.getCreateApi(),
            onCreate: self.behavior.onCreate,
            onUpdate: self.behavior.onUpdate,
            onDelete(params: Describe<T>) {
                self.paging.totalItems--;
                if (self.behavior.onDelete)
                    self.behavior.onDelete(params);
                self.remove(params.props.id)
            },
        });
    }

    /**
     * Updates just a defined segment of a specified record.
     * 
     * Usage: `await Users.update(0, {realName : 'George'});
     * 
     * @param index An index number on the `records` list
     * @param props The props you wish to update
     * @param options An object that modifies the behavior of this method
     * @returns A promise containing a response.
     */
    public partialUpdate(index: number, props: Describe<T>['props'], options: VRUpdateOptions<T>) {
        return this.records[index].partialUpdate(props, options);
    }

    /**
     * Remove a record from `records` locally, but not delete it from the server.
     * 
     * Usage: `Users.remove('xxx')`
     * 
     * @param id The uniqiue id of a record you'd like to remove from `records`
     */
    public remove(id: Describe<T>['props']['id']) {
        const index = this.findIndex(id);
        if (index >= 0) {
            this.records.splice(index, 1);
        }
    }

    /**
     * Locally empties the `records` array.
     * 
     * Usage: `Users.reset()`
     * 
     * @returns A reference to this object for chaining
     */
    public reset() {
        this.records.splice(0);
        return this;
    }

    /**
     * Sets the `new` property back to its default state. Something you usually want to do after you create a new record.
     * 
     * Usage: `Users.resetNew()`
     */

    public resetNew() {
        this.new = _.defaultsDeep({}, this.behavior.newDefaults || {});
    }

    /**
     * Fetches a single page of records.
     * 
     * Usage: `await Users.search()`
     * 
     * @param options An object that modifies the behavior of this method
     * @returns A promise containing the response
     */
    public async search(options: VKSearchOptions<T> = {}) {
        let pagination = {
            page: options?.page || this.paging.page || 1,
            itemsPerPage: this.paging.itemsPerPage || 10,
        };
        const query = _.defaultsDeep({}, pagination, options.query, this.query);

        const response = await useRest(this.getListApi(), {
            query: query,
            suppressErrorNotifications: this.behavior.suppressErrorNotifications,
        });
        if (!response.error) {
            const data: DescribeList<T> = response.data as DescribeList<T>;
            if (options.accumulate != true) {
                this.reset();
            }
            for (let index = 0; index < data.items.length; index++) {
                // @ts-expect-error - id is guaranteed on all objects
                this.append({ id: data.items[index].props.id, ...data.items[index] }, options);
            }
            this.paging = data.paging;
            const items = data.items;
            if (options?.onSearch)
                options?.onSearch(data);
            if (this.behavior.onSearch)
                this.behavior.onSearch(data);
            return items;
        }
        return response;
    }

    /**
     * Fetches a single page of records after a 500ms debounce. This is useful if you have an input tied to keyboard inputs for typeahead so that you're not submitting a search after every single keystroke.
     * 
     * Usage: `await Users.searchDebounced()`
     * 
     * @param options An object that modifies the behavior of this method
     * @returns A promise containing the response
     */
    public searchDebounced = debounce(async (options?: VKSearchOptions<T>) => {
        return this.search(options);
    }, 500, { leading: true })

    /**
     * Sorts the local `records`. This can be bound to the PrimeVue DataTable component for client side sorting.
     * 
     * Usage: `<DataTable :value="apikeys.records" @sort="(event: Event) => apikeys.sortDataTable(event)">`
     * 
     * @param event An event that was triggered by a sort request from the user
     */
    public async sortDataTable(event: any) {
        this.query.sortOrder = event.sortOrder > 0 ? 'asc' : 'desc';
        this.query.sortBy = event.sortField.split('.')[1];
        await this.search();
    }

    /**
     * Save a specific named prop back to the server.
     * 
     * Usage: `await Users.save(0, 'username')`
     * 
     * @param index The index of a record on the `records` list
     * @param prop The name of a prop you wish to ave
     * @returns A promise containing a response
     */
    public save(index: number, prop: keyof Describe<T>['props']) {
        return this.records[index].save(prop);
    }

    /**
     * Put the current set of props of a specific record back to the server.
     * 
     * Usage: `await Users.update(0)`
     * 
     * @param index The index of a record on the `records` list
     * @param options An object that changes the behavior of this method
     * @returns A promise containing a response
     */
    public update(index: number, options: VRUpdateOptions<T>) {
        return this.records[index].update(options);
    }
}

/**
 * Creates an instance of VingKind in the form of a composable
 * 
 * @param behavior An object that defines the behavior of the kind
 * @returns A VingKind instance
 */
export const useVingKind = <T extends ModelName>(behavior: VingKindParams<T> = {}) => {
    return new VingKind<T>(behavior);
}