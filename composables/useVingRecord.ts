import type { Describe, ModelName, VingRecord, VingRecordParams } from '~/types';
import { ouch } from '~/server/helpers';
import _ from 'lodash';
const notify = useNotifyStore();

/*
 *  VingRecords annot be used in a Pinia store because it contains functions
 */

/* probably don't need this anymore
function formatPropsBodyData<T extends TModelName>(props: Describe<T>['props'], options: { formatJson: string[] }) {
    var form = new FormData();
    _.forEach(props, function (value, key) {
        //console.log('--'+key+'--');
        //console.dir(value)
        if (typeof value == "object") {
            if (value instanceof File) {
                // handle file upload
                //console.log(key+' is a file');
                form.append(key, value);
            } else if (value == null) {
                // handle null
                //console.log(key+' is null');
                // skip it
            } else if (
                Array.isArray(value) &&
                (typeof value[0] == "object" ||
                    (options &&
                        options.formatJson &&
                        options.formatJson.includes(key)))
            ) {
                // handle an array of objects as JSON
                //console.log(key+' is an array of objects');
                form.append(key, JSON.stringify(value));
            } else if (Array.isArray(value)) {
                // handle an array of values as individual key value pairs
                //console.log(key+' is an array of key value pairs');
                _.forEach(value, function (element) {
                    form.append(key, element);
                });
            } else {
                // just a normal object hash
                //console.log(key+' is an object hash');
                form.append(key, JSON.stringify(value));
            }
        } else {
            // handle values
            //console.log(key+' is an normal value');
            form.append(key, value);
        }
    });
    return form;
}*/

export default <T extends ModelName>(behavior: VingRecordParams<T> = { props: {} }) => {

    const onResponseError = async (context: any) => {
        console.dir(context)
        if (!behavior.suppressErrorNotifications)
            notify.error(context.response._data.message);
    }

    const VingRecord: VingRecord<T> = {

        props: {},
        links: {},
        meta: {},
        options: {},
        related: {},
        warnings: [],
        query: { includeLinks: true, ...behavior.query },
        behavior,

        setState(result) {
            this.props = result.props;
            this.links = result.links;
            this.meta = result.meta;
            this.options = result.options;
            this.related = result.related;
            this.warnings = result.warnings;
            this.dispatchWarnings();
        },

        dispatchWarnings() {
            if (this.warnings) {
                for (const warning of this.warnings) {
                    document.dispatchEvent(
                        new CustomEvent("wing_warn", {
                            // @ts-ignore
                            message: warning.message,
                        })
                    );
                    notify.warn(warning.message);
                }
            }
        },

        getCreateApi() {
            if (this.behavior.createApi) {
                return this.behavior.createApi;
            }
            else if (this.behavior.links?.base) {
                return this.behavior.links.base;
            }
            notify.error('No createApi');
            throw ouch(401, 'No createApi');
        },

        getFetchApi() {
            if (this.behavior.fetchApi) {
                return this.behavior.fetchApi;
            }
            else if (this.behavior.links?.self) {
                return this.behavior.links.self;
            }
            notify.error('No fetchApi');
            throw ouch(401, 'No fetchApi');
        },

        fetch() {
            const self = this;
            const promise = useFetch(this.getFetchApi(), {
                query: this.query,
                onResponseError,
            });
            promise.then((response) => {
                const data: Describe<T> = response.data.value as Describe<T>;
                self.setState(data);
                if (behavior?.onFetch)
                    behavior.onFetch(data, this);
            })
                .catch((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    if (behavior?.onError)
                        behavior.onError(data, this);
                });
            return promise;
        },

        _partialUpdate(props, options = {}) {
            // if we were calling formatPropsBodyData here is where we would call it
            const self = this;

            const promise = useFetch(this.getSelfApi, {
                query: this.query,
                method: 'put',
                body: props,
                onResponseError,
            });

            promise.then((response) => {
                const data: Describe<T> = response.data.value as Describe<T>;
                self.setState(data);
                if (options?.onUpdate)
                    options.onUpdate(data, this);
                if (behavior?.onUpdate)
                    behavior.onUpdate(data, this);
            })
                .catch((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    if (options?.onError)
                        options.onError(data, this);
                    if (behavior?.onError)
                        behavior.onError(data, this);
                });
            return promise;
        },

        partialUpdate: _.debounce(function (props, options) {
            // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
            return this._partialUpdate(props, options);
        }, 200),

        save: _.debounce(function (name, value) {
            // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
            return this._save(name, value);
        }, 200),

        _save: function (name, value) {
            const self = this;
            const update: Describe<T>['props'] = {};
            if (self.props && value === undefined) {
                update[name] = self.props[name];
            }
            else if (value !== undefined) {
                // @ts-ignore - not sure why this is a problem since it is properly typed in the interface
                update[name] = value;
            }
            return self._partialUpdate(update);
        },

        update(options?: {}) {
            return this.partialUpdate(this.props, options);
        },

        create(props, options) {
            const self = this;
            const newProps = _.extend({}, this.props, props);

            const promise = useFetch(this.getCreateApi(), {
                query: this.query,
                method: 'post',
                body: newProps,
                onResponseError,
            });

            promise.then((response) => {
                const data: Describe<T> = response.data.value as Describe<T>;
                self.setState(data);
                if (options?.onCreate)
                    options.onCreate(data, this);
                if (behavior?.onCreate)
                    behavior.onCreate(data, this);
            })
                .catch((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    if (options?.onError)
                        options.onError(data, this);
                    if (behavior?.onError)
                        behavior.onError(data, this);
                });
            return promise;
        },

        getSelfApi() {
            if (this.links?.self) {
                return this.links.self;
            }
            notify.error('No links.self');
            throw ouch(400, 'No links.self');
        },

        delete(options = {}) {
            const self = this;
            let message = "Are you sure?";
            if ("name" in this.props) {
                message = "Are you sure you want to delete " + this.props.name + "?";
            }
            if (options.skipConfirm || confirm(message)) {
                const promise = useFetch(this.getSelfApi, {
                    query: self.query,
                    method: 'delete',
                    onResponseError,
                });
                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    if (options?.onDelete)
                        options.onDelete(data, this);
                    if (behavior?.onDelete)
                        behavior.onDelete(data, this);
                })
                    .catch((response) => {
                        const data: Describe<T> = response as Describe<T>;
                        console.log(response)
                        if (options?.onError)
                            options.onError(data, this);
                        if (behavior?.onError)
                            behavior.onError(data, this);
                    });
                return promise
            }

        }
    };

    VingRecord.setState(behavior as Describe<T>);

    return VingRecord;
}