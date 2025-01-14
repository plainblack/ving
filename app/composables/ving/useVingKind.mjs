import { defu } from "defu";
import { debounce } from 'perfect-debounce';
class VingKind {
    #notify = useNotify();

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
     * @param {object} behavior An object configuring the endpoints and other info about this kind.
     */

    #behavior = {};

    constructor(behavior = {}) {
        this.#behavior = behavior;
        this.query = defu(this.query, this.#behavior.query);
        this.resetNew();
    }

    /**
     * Retrieves all the records for the given configuration.
     * 
     * NOTE: This method should not be called on a page that has no nuxt middleware such as `auth`. If you need to, then use the `all-workaround` middlware provided. See https://github.com/plainblack/ving/issues/168
     * 
     * @param {Object} options An object for modifying the the method's functionality. See `search` for more info.
     * @param {Function} options.onAllDone An optional callback that will be called when all the requests have been processed.
     * @example
     * await Users.all();
     */

    async all(options = {}) {
        let totalPages = 1;
        for (let pageNo = 1; pageNo <= totalPages; pageNo++) {
            await this.search({
                ...options,
                accumulate: true,
                page: pageNo,
            });
            totalPages = this.paging.totalPages;
        }
        if (options.onAllDone)
            options.onAllDone();
        if (this.#behavior.onAllDone)
            this.#behavior.onAllDone();
    }


    /**
     * Adds a record to the end of the `records` property. You should never call this method directly unless you know what you're doing.
     * 
     * @param {Object} record An object containing a series of other objects that you get back when call the `describe` method of a record server side.
     * @param {Object} options Optional.
     * @return {Object} A new record
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
     * @param {string} method `put`, `post`, `get` or `delete`.
     * @param {string} url The endpoint to run this call on.
     * @param {object} query An object containing query parameters to pass to this call.
     * @param {object} options Modify the behavior of this call.
     * @returns {Promise<object>} A promise containing the response to the call.
     * @example
     * const result = Users.call('post', '/users/xxx/send-reset-password', {os:'Windows'});
     */
    async call(method, url, query = {}, options = {}) {
        const response = await useRest(url, {
            query: defu({}, query, this.query),
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
     * @param {object} props A list of props for this kind.
     * @param {object} options An object that changes the behavior of this method.
     * @returns {Promise<object>} A promise containing the response.
     * @example
     * await Users.create()
     */
    create(props = {}, options = {}) {
        const self = this;
        const newProps = defu({}, props, self.new);
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
     * @param {number} index An index on the `records` list you wish to delete.
     * @param {object} options An object to change the behavior of this method.
     * @returns {Promise<object>} A promise that contains the response.
     * @example
     * await Users.delete(0)
     */

    delete(index, options) {
        return this.records[index].delete(options);
    }

    /**
     * Frees the memory associated with the list of records
     * @example
     * onBeforeRouteLeave(() => users.dispose());
     */
    dispose() {
        for (const record of this.records) {
            record.dispose();
        }
        this.records.splice(0);
    }

    /**
     * Fetches the list of enum options for this kind, which can be helpful when creating a new record.
     * 
     * @param {object} options An object that changes the behavior of this method.
     * @returns {Promise<object>} A promise that contains the response.
     * @example
     * await Users.fetchPropsOptions()
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
     * @param {string} id The unique id of a record on the `records` list that you which to get a reference to.
     * @returns {object} A record.
     * @example
     * const user = Users.find('xxx');
     */
    find(id) {
        const index = this.findIndex(id);
        if (index >= 0) {
            return this.records[index];
        }
        else {
            throw createError({ statusCode: 404, message: `cannot find "${id}" in record list` });
        }
    }


    /**
     * Returns the index of a specific record in the local `records` list.
     * 
     * @param {string} id The unique id of the record.
     * @returns {number} A record array index.
     * @example
     * const idx = Users.findIndex(id);
     */
    findIndex(id) {
        return this.records.findIndex((obj) => obj.props.id == id);
    }

    /**
     * Returns the configured endpoint for creating records of this kind or throws an error if it cannot.
     * @returns {string} An endpoint url
     * @example
     * const url = Users.getCreateApi()
     */
    getCreateApi() {
        if (this.#behavior.createApi) {
            return this.#behavior.createApi;
        }
        this.#notify.error('No createApi');
        throw createError({ statusCode: 401, message: 'No createApi' });
    }

    /**
     * Returns the configured endpoint for fetching the list of records of this kind or throws an error if it cannot.
     * 
     * @returns {string} An endpoint url
     * @example
     * const url = Users.getListApi()
     */
    getListApi() {
        if (this.#behavior.listApi) {
            return this.#behavior.listApi;
        }
        this.#notify.error('No listApi');
        throw createError({ statusCode: 401, message: 'No listApi' });
    }

    /**
     * Returns the configured endpoint for fetching the enumerated props options for this kind or throws an error if it cannot.
     * 
     * @returns {string} An endpoint url
     * @example
     * const url = Users.getPropsOptionsApi()
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
     * @param {object} params A describe object for the user that must at minimum have a list of props you want to use for the user
     * @returns {object} A newly minted record.
     * @example
     * const newRecord = Users.mind({props : 'username'})
     */
    mint(params) {
        const self = this;
        return useVingRecord({
            ...params,
            ego: self.#behavior.ego,
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
     * @param {number} index An index number on the `records` list
     * @param {object} props The props you wish to update
     * @param {object} options An object that modifies the behavior of this method
     * @returns {Promise<object>} A promise containing a response.
     * @example
     * await users.partialUpdate(0, {realName : 'George'});
     */
    partialUpdate(index, props, options) {
        return this.records[index].partialUpdate(props, options);
    }

    /**
     * Turns the list of records into an array compatible with various components such as FormInput, Select, and Autocomplete
     * 
     * @param {'props'|'meta'|'extra'} section One of the describe section names such as `props`, or `meta`, or `extra`.
     * @param {string} field The name of the field within the `section` that will serve as the labelf for this option list.
     * @param {Function} filter An optional function that will be passed to an array filter to filter out any unwanted records from the current list of records.
     * @returns {object[]} An array of objects with `label` and `value` attributes.
     * @example
     * users.recordsAsOptions('meta','displayName')
     */
    recordsAsOptions(section, field, filter = () => true) {
        let out = [];
        for (const record of this.records) {
            if (!(filter(record)))
                continue;
            out.push({
                value: record.props?.id,
                label: record[section][field]
            });
        }
        return out;
    }

    /**
     * Remove a record from `records` locally, but not delete it from the server.
     * 
     * @param {string} id The uniqiue id of a record you'd like to remove from `records`
     * @example
     * users.remove('xxx')
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
     * Sets the `new` property back to its default state. Something you usually want to do after you create a new record.
     * @example
     * Users.resetNew()
     */

    resetNew() {
        this.new = defu({}, this.#behavior.newDefaults || {});
    }

    /**
     * Fetches a single page of records.
     * 
     * @param {object} options An object that modifies the behavior of this method
     * @returns {Promise<object>} A promise containing the response
     * @example
     * await Users.search()
     */
    async search(options = {}) {
        let pagination = {
            page: options?.page || this.paging.page || 1,
            itemsPerPage: this.paging.itemsPerPage || 10,
        };
        const query = defu({}, options?.query, this.query, pagination);

        const response = await useRest(this.getListApi(), {
            query: query,
            suppressErrorNotifications: this.#behavior.suppressErrorNotifications,
        });
        if (!response.error) {
            const data = response.data;
            if (options.accumulate != true) {
                this.dispose();
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
     * @param {object} options An object that modifies the behavior of this method
     * @returns {Promise<object>} A promise containing the response
     * @example
     * await Users.searchDebounced()
     */
    searchDebounced = debounce(async (options) => {
        return this.search(options);
    }, 500, { leading: true })

    /**
     * Sorts the local `records`. This can be bound to the PrimeVue DataTable component for client side sorting.
     * 
     * @param {Event} event An event that was triggered by a sort request from the user
     * @example
     * <DataTable :value="apikeys.records" @sort="(event: Event) => apikeys.sortDataTable(event)">
     */
    async sortDataTable(event) {
        this.query.sortOrder = event.sortOrder > 0 ? 'asc' : 'desc';
        this.query.sortBy = event.sortField.split('.')[1];
        await this.search();
    }

    /**
     * Save a specific named prop back to the server.
     * 
     * @param {number} index The index of a record on the `records` list
     * @param {string} prop The name of a prop you wish to ave
     * @returns {Promise<object>} A promise containing a response
     * @example
     * await Users.save(0, 'username')
     */
    save(index, prop) {
        return this.records[index].save(prop);
    }

    /**
     * Put the current set of props of a specific record back to the server.
     * 
     * @param {number} index The index of a record on the `records` list
     * @param {object} options An object that changes the behavior of this method
     * @returns {Promise<object>} A promise containing a response
     * @example
     * await Users.update(0)
     */
    update(index, options) {
        return this.records[index].update(options);
    }
}

/**
 * Creates an instance of VingKind in the form of a composable
 * 
 * @param {object} behavior An object that defines the behavior of the kind
 * @param {boolean} behavior.unshift If true, new records will be added to the beginning of the list instead of the end.
 * @param {boolean} behavior.suppressErrorNotifications If true, errors will not be displayed to the user.
 * @param {object} behavior.query An object containing query parameters to send when interacting with endpoints for this kind.
 * @param {object} behavior.newDefaults An object containing default values for new records.
 * @param {function} behavior.onCreate A callback function that will be called when a new record is created.
 * @param {function} behavior.onUpdate A callback function that will be called when a record is updated.
 * @param {function} behavior.onDelete A callback function that will be called when a record is deleted.
 * @param {function} behavior.onSearch A callback function that will be called when a search is performed.
 * @param {function} behavior.onAllDone A callback function that will be called when all the requests have been processed.
 * @param {function} behavior.onEach A callback function that will be called for each record fetched.
 * @param {string} behavior.createApi The endpoint for creating records.
 * @param {string} behavior.listApi The endpoint for fetching the list of records.
 * @param {string} behavior.optionsApi The endpoint for fetching the enumerated props options.
 * @param {string} behavior.ego An optional string that will be prepended to the id of fetched records in Pinia so that they can be distinguished from other instances of the same record. Useful if you're loading multiple instances of the same object on the same page.
 * @returns {object} A VingKind instance
 */
export const useVingKind = (behavior = {}) => {
    return new VingKind(behavior);
}