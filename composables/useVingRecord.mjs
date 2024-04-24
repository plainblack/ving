import { defineStore } from 'pinia';
import { defu } from "defu";
import { v4 } from 'uuid';
import { ouch } from '#ving/utils/ouch.mjs';
import { isObject, isUndefined } from '#ving/utils/identify.mjs';

export default (behavior) => {
    const notify = useNotifyStore();

    const generate = defineStore(behavior.id || v4(), {
        state: () => ({
            props: behavior.props || {},
            meta: behavior.meta || {},
            extra: behavior.extra || {},
            options: behavior.options || {},
            links: behavior.links || {},
            related: behavior.related || {},
            warnings: behavior.warnings || [],
            query: { includeLinks: true, ...behavior.query },
            createApi: behavior.createApi,
            fetchApi: behavior.fetchApi,
        }),
        actions: {

            /**
             * A quick way to call an endpoint without directly setting up your own `useRest()` composable. The result then updates the local object.
             *
             * @param {'put'|'post'|'get'|'delete'} method `put`, `post`, `get` or `delete`.
             * @param {String} url The endpoint to run this call on.
             * @param {Object} query An object containing query parameters to pass to this call. The same as behavior.query when you created this object.
             * @param {Object} options Modify the behavior of this call.
             * @param {Function} options.onError A function to be run when this call fail.
             * @param {Function} options.onSuccess A function to be run when this call succeeds.
             * @param {Object} options.body A fetch body param.
             * @returns {Promise<object>} A promise containing the response to the call.
             * @example
             * const result = user.call('post', user.links.self?.href+'/send-reset-password', {os:'Windows'});
             */
            async call(method, url, query = {}, options = {}) {

                const response = await useRest(url, {
                    query: defu({}, this.query, query),
                    method,
                    body: options.body,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });
                if (response.error) {
                    if (options?.onError) {
                        options?.onError(response.error);
                    }
                }
                else {
                    const data = response.data;
                    this.setState(data);
                    if (options?.onSuccess) {
                        options?.onSuccess(data);
                    }
                }
                return response;
            },

            /**
             * Creates a new record on the server and updates its attributes locally.
             * 
             * @param {object} props An optional list of props for this record.
             * @param {object} options An object that changes the behavior of this method.
             * @returns {Promise<object>} A promise containing the response.
             * @example
             * await user.create()
             */

            async create(props, options) {
                const newProps = defu({}, props, this.props);
                const response = await useRest(this.getCreateApi(), {
                    query: this.query,
                    method: 'post',
                    body: newProps,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });
                if (response.error) {
                    const data = response.data;
                    if (options?.onError)
                        options.onError(response.error);
                    if (behavior?.onError)
                        behavior.onError(response.error);
                }
                else {
                    const data = response.data;
                    this.setState(data);
                    if (options?.onCreate)
                        options.onCreate(data);
                    if (behavior?.onCreate)
                        behavior.onCreate(data);
                }
                return response;
            },

            /**
             * Removes a record from the server.
             * 
             * @param {object} options An object to change the behavior of this method.
             * @returns {Promise<object>} A promise that contains the response.
             * @example
             * await user.delete()
             */
            async delete(options = {}) {
                let message = "Are you sure?";
                if (isObject(this.props) && "name" in this.props) {
                    message = "Are you sure you want to delete " + this.props.name + "?";
                }
                if (options.skipConfirm || confirm(message)) {
                    const response = await useRest(this.getSelfApi(), {
                        query: this.query,
                        method: 'delete',
                        suppressErrorNotifications: behavior.suppressErrorNotifications,
                    });
                    if (response.error) {
                        if (options?.onError)
                            options.onError(response.error);
                        if (behavior?.onError)
                            behavior.onError(response.error);
                    }
                    else {
                        const data = response.data;
                        if (options?.onDelete)
                            options.onDelete(data);
                        if (behavior?.onDelete)
                            behavior.onDelete(data);
                    }
                    return response;
                }
            },

            /**
             * Any warnings currently in the state will be displayed on screen to the user through the notifications system. Under normal circumstances you should never need to call this method directly.
             * @example
             * user.dispatchWarnings()
             */
            dispatchWarnings() {
                if (this.warnings) {
                    for (const warning of this.warnings) {
                        document.dispatchEvent(
                            new CustomEvent("wing_warn", {
                                message: warning.message,
                            })
                        );
                        notify.warn(warning.message);
                    }
                }
            },

            /**
             * Frees the memory associated with this record. Be sure to also 
             * add something like `v-if="user.props?.id"` to a wrapping div to
             * avoid a Vue crash.
             * @example
             * onBeforeRouteLeave(() => user.dispose());
             */
            dispose() {
                this.$reset();
                this.$dispose();
                const pinia = usePinia();
                delete pinia.state.value[this.$id];
            },

            /**
            * Fetches the configured object from the server.
            * 
            * @returns {Promise<object>} A promise containing a response.
            * @example
            * await user.fetch()
            */
            async fetch() {
                const response = await useRest(this.getFetchApi(), {
                    query: this.query,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });
                if (response.error) {
                    if (behavior?.onError)
                        behavior.onError(response.error);
                }
                else {
                    const data = response.data;
                    this.setState(data);
                    if (behavior?.onFetch)
                        behavior.onFetch(data);
                }
                return response;
            },

            /**
             * Returns the configured endpoint for creating records of this kind or throws an error if it cannot.
             * 
             * @returns {string} An endpoint url.
             * @example
             * const url = user.getCreateApi()
             */
            getCreateApi() {
                if (this.createApi) {
                    return this.createApi;
                }
                else if (this.links?.base) {
                    return this.links.base?.href;
                }
                notify.error('No createApi');
                throw ouch(401, 'No createApi');
            },

            /**
             * Returns the configured endpoint for fetching a record of this kind or throws an error if it cannot.
             * 
             * @returns {string} An endpoint url.
             * @example
             * const url = user.getFetchApi()
             */
            getFetchApi() {
                if (this.fetchApi) {
                    return this.fetchApi;
                }
                else if (this.links?.self) {
                    return this.links.self?.href;
                }
                notify.error('No fetchApi');
                throw ouch(401, 'No fetchApi');
            },

            /**
             * Returns the configured endpoint for refetching the already fetched object or throws an error if it cannot.
             * 
             * @returns {string} An endpoint url.
             * @example
             * const url = user.getSelfApi()
             */
            getSelfApi() {
                if (this.links?.self) {
                    return this.links.self?.href;
                }
                notify.error('No links.self');
                throw ouch(400, 'No links.self');
            },

            /**
             * A wrapper around `call` that posts to an S3File import route
             * @param {String} relationName The name of the S3File relationship on this record.
             * @param {String} s3file The id of the S3File record you'd like to import.
             * @see call()
             * @returns {Object} A response object.
             */
            async importS3File(relationName, s3FileId) {
                return await this.call('PUT', this.links.self?.href + '/import-' + relationName, undefined, { body: { s3FileId } })
            },

            /**
             * Updates just a defined segment of a the record.
             * 
             * @param {object} props The props to update
             * @param {object} options An object that modifies the behavior of this method
             * @returns {Promise<object>} A promise that contains a response
             * @example
             * await user.partialUpdate({realName : 'George'});
             */
            async partialUpdate(props, options = {}) {
                const response = await useRest(this.getSelfApi(), {
                    query: this.query,
                    method: 'put',
                    body: props,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });
                if (response.error) {
                    if (options?.onError)
                        options.onError(response.error);
                    if (behavior?.onError)
                        behavior.onError(response.error);
                }
                else {
                    const data = response.data;
                    this.setState(data);
                    if (options?.onUpdate)
                        options.onUpdate(data);
                    if (behavior?.onUpdate)
                        behavior.onUpdate(data);
                }
                return response;
            },

            /**
             * Save a specific named prop back to the server.
             * 
             * @param {string} name The name of a property to update
             * @param {*} value Optionally specify a value to update in local memory before submitting to the server.
             * @returns {Promise<object>} A promise that contains a response
             * @example
             * await user.save('username')
             */
            save: function (name, value) {
                const update = {};
                if (this.props && isUndefined(value)) {
                    update[name] = this.props[name];
                }
                else if (!isUndefined(value)) {
                    update[name] = value;
                }
                return this.partialUpdate(update);
            },

            /**
             * Updates the reactive state of all the data from a rest request into the local object and also dispatches any generated warnings. Generally you won't have to use this method directly.
             * 
             * @param {object} result The data resulting from a Rest request to a Ving Record endpoint
             * @example
             * user.setState(response.data)
             */
            setState(result) {
                this.props = result.props;
                this.links = result.links;
                this.meta = result.meta;
                this.extra = result.extra;
                this.options = result.options;
                this.related = result.related;
                this.warnings = result.warnings;
                this.dispatchWarnings();
            },

            /**
             * Put the current set of props of a specific record back to the server.
             * 
             * @param {object} options An object that changes the behavior of this object
             * @returns {Promise<object>} A promise that contains a response
             * @example
             * await user.update()
             */
            update(options) {
                return this.partialUpdate(this.props, options);
            },

        }
    });

    return generate();
}