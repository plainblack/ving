import _ from 'lodash';
import { debounce } from 'perfect-debounce';
import { ouch } from '#ving/utils/ouch.mjs';
class VingKind {
    #notify = useNotifyStore();

    #state = reactive({
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

    get new() {
        return this.#state.new;
    }

    set new(value) {
        this.#state.new = value;
    }

    /**
     * The object containing paging data.
     */
    get paging() {
        return this.#state.paging;
    }

    set paging(value) {
        this.#state.paging = value;
    }

    /**
     * The object containing enumerated props options once `fetchPropsOptions` is called.
     */
    get propsOptions() {
        return this.#state.propsOptions;
    }

    set propsOptions(value) {
        this.#state.propsOptions = value;
    }

    /**
     * An object containing the query parameters to send when interacting with endpoints for this kind.
     */

    get query() {
        return this.#state.query;
    }

    set query(value) {
        this.#state.query = value;
    }

    /**
     * An array containing the list of records that have been fetched from the server.
     */
    get records() {
        return this.#state.records;
    }

    set records(value) {
        this.#state.records = value;
    }

    /**
     * Constructor.
     * @param behavior An object configuring the endpoints and other info about this kind.
     */

    #behavior = {};

    constructor(behavior = {}) {
        this.#behavior = behavior;
        this.query = _.defaultsDeep(this.query, this.#behavior.query);
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

    all(options = {}, iterations = 1) {
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
                            this.#notify.error(message);
                            throw ouch(400, message);
                        }
                    } else {
                        if (options.onAllDone)
                            options.onAllDone();
                        if (self.#behavior.onAllDone)
                            self.#behavior.onAllDone();
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
    append(record, options) {
        const newRecord = this.mint(record);
        newRecord.setState(record); // need to override state with newly fetched data in case its already loaded
        this.records.push(newRecord);
        if (options.onEach) {
            options.onEach(record);
        }
        if (this.#behavior.onEach) {
            this.#behavior.onEach(record);
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
    async call(method, url, query = {}, options = {}) {
        const response = await useRest(url, {
            query: _.defaultsDeep({}, this.query, query),
            method,
            suppressErrorNotifications: this.#behavior.suppressErrorNotifications,
        });
        if (response.error) {
            if (options?.onError)
                options?.onError(response.error);
        }
        else {
            const data = response.data;
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
    create(props = {}, options = {}) {
        const self = this;
        const newProps = _.defaultsDeep({}, props, self.new);
        const newRecord = self.mint({ props: newProps });
        const addIt = function () {
            if (options?.unshift || self.#behavior?.unshift) {
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

    delete(index, options) {
        return this.records[index].delete(options);
    }

    /**
     * Frees the memory associated with the list of records
     * 
     * Usage: `onBeforeRouteLeave(() => users.dispose());`
     */
    dispose() {
        for (const record of this.records) {
            record.dispose();
        }
        this.reset();
    }

    /**
     * Fetches the list of enum options for this kind, which can be helpful when creating a new record.
     * 
     * Usage: `await Users.fetchPropsOptions()`
     * 
     * @param options An object that changes the behavior of this method.
     * @returns A promise that contains the response.
     */
    async fetchPropsOptions(options = {}) {
        const response = await useRest(this.getPropsOptionsApi(), {
            suppressErrorNotifications: this.#behavior.suppressErrorNotifications,
        });
        if (response.error) {
            if (options?.onError)
                options?.onError(response.error);
        }
        else {
            const data = response.data;
            this.propsOptions = data;
            if (options?.onSuccess)
                options?.onSuccess(data);
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
    find(id) {
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
    findIndex(id) {
        return this.records.findIndex((obj) => obj.props.id == id);
    }

    /**
     * Returns the configured endpoint for creating records of this kind or throws an error if it cannot.
     * 
     * Usage: `const url = Users.getCreateApi()`
     * @returns An endpoint url
     */
    getCreateApi() {
        if (this.#behavior.createApi) {
            return this.#behavior.createApi;
        }
        this.#notify.error('No createApi');
        throw ouch(401, 'No createApi');
    }

    /**
     * Returns the configured endpoint for fetching the list of records of this kind or throws an error if it cannot.
     * 
     * Usage: `const url = Users.getListApi()`
     * 
     * @returns An endpoint url
     */
    getListApi() {
        if (this.#behavior.listApi) {
            return this.#behavior.listApi;
        }
        this.#notify.error('No listApi');
        throw ouch(401, 'No listApi');
    }

    /**
     * Returns the configured endpoint for fetching the enumerated props options for this kind or throws an error if it cannot.
     * 
     * Usage: `const url = Users.getPropsOptionsApi()`
     * 
     * @returns An endpoint url
     */
    getPropsOptionsApi() {
        if (this.#behavior.optionsApi != null) {
            return this.#behavior.optionsApi;
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
    mint(params) {
        const self = this;
        return useVingRecord({
            ...params,
            query: self.query,
            createApi: self.getCreateApi(),
            onCreate: self.#behavior.onCreate,
            onUpdate: self.#behavior.onUpdate,
            onDelete(params) {
                self.paging.totalItems--;
                if (self.#behavior.onDelete)
                    self.#behavior.onDelete(params);
                self.remove(params.props.id)
            },
        });
    }

    /**
     * Updates just a defined segment of a specified record.
     * 
     * Usage: `await users.partialUpdate(0, {realName : 'George'});
     * 
     * @param index An index number on the `records` list
     * @param props The props you wish to update
     * @param options An object that modifies the behavior of this method
     * @returns A promise containing a response.
     */
    partialUpdate(index, props, options) {
        return this.records[index].partialUpdate(props, options);
    }

    /**
     * Turns the list of records into an array compatible with various components such as SelectInput and Autocomplete
     * Usage: `users.recordsAsOptions('meta','displayName')`
     * 
     * @param {'props'|'meta'|'extra'} section One of the describe section names such as `props`, or `meta`, or `extra`.
     * @param {string} field The name of the field within the `section` that will serve as the labelf for this option list.
     * @returns {Object[]} An array of objects with `label` and `value` attributes.
     */
    recordsAsOptions(section, field) {
        return this.records.map(u => {
            return {
                value: u.props?.id,
                label: u[section][field]
            }
        })
    }

    /**
     * Remove a record from `records` locally, but not delete it from the server.
     * 
     * Usage: `users.remove('xxx')`
     * 
     * @param id The uniqiue id of a record you'd like to remove from `records`
     */
    remove(id) {
        const index = this.findIndex(id);
        if (index >= 0) {
            this.records.splice(index, 1);
        }
        else {
            console.log(`Could not find ${id} to delete it.`);
        }
    }

    /**
     * Locally empties the `records` array.
     * 
     * Usage: `users.reset()`
     * 
     * @returns A reference to this object for chaining
     */
    reset() {
        this.records.splice(0);
        return this;
    }

    /**
     * Sets the `new` property back to its default state. Something you usually want to do after you create a new record.
     * 
     * Usage: `Users.resetNew()`
     */

    resetNew() {
        this.new = _.defaultsDeep({}, this.#behavior.newDefaults || {});
    }

    /**
     * Fetches a single page of records.
     * 
     * Usage: `await Users.search()`
     * 
     * @param options An object that modifies the behavior of this method
     * @returns A promise containing the response
     */
    async search(options = {}) {
        let pagination = {
            page: options?.page || this.paging.page || 1,
            itemsPerPage: this.paging.itemsPerPage || 10,
        };
        const query = _.defaultsDeep({}, pagination, options?.query, this.query);

        const response = await useRest(this.getListApi(), {
            query: query,
            suppressErrorNotifications: this.#behavior.suppressErrorNotifications,
        });
        if (!response.error) {
            const data = response.data;
            if (options.accumulate != true) {
                this.reset();
            }
            for (let index = 0; index < data.items.length; index++) {
                this.append({ id: data.items[index].props.id, ...data.items[index] }, options);
            }
            this.paging = data.paging;
            const items = data.items;
            if (options?.onSearch)
                options?.onSearch(data);
            if (this.#behavior.onSearch)
                this.#behavior.onSearch(data);
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
    searchDebounced = debounce(async (options) => {
        return this.search(options);
    }, 500, { leading: true })

    /**
     * Sorts the local `records`. This can be bound to the PrimeVue DataTable component for client side sorting.
     * 
     * Usage: `<DataTable :value="apikeys.records" @sort="(event: Event) => apikeys.sortDataTable(event)">`
     * 
     * @param event An event that was triggered by a sort request from the user
     */
    async sortDataTable(event) {
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
    save(index, prop) {
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
    update(index, options) {
        return this.records[index].update(options);
    }
}

/**
 * Creates an instance of VingKind in the form of a composable
 * 
 * @param behavior An object that defines the behavior of the kind
 * @returns A VingKind instance
 */
export const useVingKind = (behavior = {}) => {
    return new VingKind(behavior);
}