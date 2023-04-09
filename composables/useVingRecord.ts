import { defineStore } from 'pinia';
import type { Describe, ModelName, VingRecordParams, VRQueryParams, VRUpdateOptions, VRCreateOptions, VRDeleteOptions, DescribeParams, VRGenericOptions } from '~/types';
import { ouch } from '~/server/helpers';
import _ from 'lodash';
import { v4 } from 'uuid';

export default <T extends ModelName>(behavior: VingRecordParams<T>) => {
    const notify = useNotifyStore();

    const generate = defineStore(behavior.id || v4(), {
        state: (): {
            props?: Describe<T>['props'],
            meta?: Describe<T>['meta'],
            options?: Describe<T>['options'],
            links?: Describe<T>['links'],
            related?: Describe<T>['related'],
            warnings?: Describe<T>['warnings'],
            query?: VRQueryParams,
            createApi?: string,
            fetchApi?: string,
        } => ({
            props: behavior.props || {},
            meta: behavior.meta || {},
            options: behavior.options || {},
            links: behavior.links || {},
            related: behavior.related || {},
            warnings: behavior.warnings || [],
            query: { includeLinks: true, ...behavior.query },
            createApi: behavior.createApi,
            fetchApi: behavior.fetchApi,
        }),
        actions: {
            ...behavior.extendActions,

            setState(result: Describe<T>) {
                // @ts-expect-error - https://github.com/vuejs/core/issues/7278
                this.props = result.props;
                this.links = result.links;
                this.meta = result.meta;
                // @ts-expect-error - https://github.com/vuejs/core/issues/7278
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
                                // @ts-expect-error
                                message: warning.message,
                            })
                        );
                        notify.warn(warning.message);
                    }
                }
            },

            getCreateApi(): string {
                if (this.createApi) {
                    return this.createApi;
                }
                else if (this.links?.base) {
                    return this.links.base;
                }
                notify.error('No createApi');
                throw ouch(401, 'No createApi');
            },

            getFetchApi() {
                if (this.fetchApi) {
                    return this.fetchApi;
                }
                else if (this.links?.self) {
                    return this.links.self;
                }
                notify.error('No fetchApi');
                throw ouch(401, 'No fetchApi');
            },

            fetch() {
                const self = this;
                const promise = useHTTP(this.getFetchApi(), {
                    query: this.query,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });
                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    self.setState(data);
                    if (behavior?.onFetch)
                        behavior.onFetch(data);
                })
                    .catch((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (behavior?.onError)
                            behavior.onError(data);
                    });
                return promise;
            },

            _partialUpdate(props?: Describe<T>['props'], options: VRUpdateOptions<T> = {}) {
                // if we were calling formatPropsBodyData here is where we would call it
                const self = this;

                const promise = useHTTP(this.getSelfApi(), {
                    query: this.query,
                    method: 'put',
                    body: props,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });

                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    self.setState(data);
                    if (options?.onUpdate)
                        options.onUpdate(data);
                    if (behavior?.onUpdate)
                        behavior.onUpdate(data);
                })
                    .catch((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (options?.onError)
                            options.onError(data);
                        if (behavior?.onError)
                            behavior.onError(data);
                    });
                return promise;
            },

            partialUpdate: _.debounce(function (props: Describe<T>['props'], options?: VRUpdateOptions<T>) {
                // @ts-expect-error - i think the nature of the construction of this method makes ts think there is a problem when there isn't
                return this._partialUpdate(props, options);
            }, 200),

            save: _.debounce(function <K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]) {
                // @ts-expect-error - i think the nature of the construction of this method makes ts think there is a problem when there isn't
                return this._save(name, value);
            }, 200),

            _save: function <K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]) {
                const self = this;
                const update: Describe<T>['props'] = {};
                if (self.props && value === undefined) {
                    //@ts-expect-error
                    update[name] = self.props[name];
                }
                else if (value !== undefined) {
                    // @ts-expect-error - not sure why this is a problem since it is properly typed in the interface
                    update[name] = value;
                }
                return self._partialUpdate(update);
            },

            update(options?: VRUpdateOptions<T>) {
                //@ts-expect-error - https://github.com/vuejs/core/issues/7278
                return this.partialUpdate(this.props, options);
            },

            create(props?: Describe<T>['props'], options?: VRCreateOptions<T>) {
                const self = this;
                const newProps = _.extend({}, this.props, props);

                const promise = useHTTP(this.getCreateApi(), {
                    query: this.query,
                    method: 'post',
                    body: newProps,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });

                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    self.setState(data);
                    if (options?.onCreate)
                        options.onCreate(data);
                    if (behavior?.onCreate)
                        behavior.onCreate(data);
                })
                    .catch((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (options?.onError)
                            options.onError(data);
                        if (behavior?.onError)
                            behavior.onError(data);
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

            call(method: "post" | "put" | "delete" | "get", url: string, query: DescribeParams = {}, options: VRGenericOptions<T> = {}) {
                const self = this;
                const promise = useHTTP(url, {
                    query: _.extend({}, self.query, query),
                    method,
                    suppressErrorNotifications: behavior.suppressErrorNotifications,
                });
                promise.then((response) => {
                    const data: Describe<T> = response.data.value as Describe<T>;
                    self.setState(data);

                    if (options?.onSuccess) {
                        options?.onSuccess(data);
                    }
                })
                    .catch((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (options?.onError) {
                            options?.onError(data);
                        }
                    });
                return promise;
            },

            delete(options: VRDeleteOptions<T> = {}) {
                const self = this;
                let message = "Are you sure?";
                if (this.props && typeof this.props == 'object' && "name" in this.props) {
                    message = "Are you sure you want to delete " + this.props.name + "?";
                }
                if (options.skipConfirm || confirm(message)) {
                    const promise = useHTTP(this.getSelfApi(), {
                        query: self.query,
                        method: 'delete',
                        suppressErrorNotifications: behavior.suppressErrorNotifications,
                    });
                    promise.then((response) => {
                        const data: Describe<T> = response.data.value as Describe<T>;
                        if (options?.onDelete)
                            options.onDelete(data);
                        if (behavior?.onDelete)
                            behavior.onDelete(data);
                    })
                        .catch((response) => {
                            const data: Describe<T> = response.data.value as Describe<T>;
                            if (options?.onError)
                                options.onError(data);
                            if (behavior?.onError)
                                behavior.onError(data);
                        });
                    return promise
                }

            }
        }
    });

    return generate();
}