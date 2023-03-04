import { Describe, TModelName } from '~/app/db';
import { ouch } from '~/app/helpers';
import _ from 'lodash';
const notify = useNotifyStore();

type QueryParams = {
    includeOptions?: boolean,
    includeMeta?: boolean,
    includeRelated?: string[],
    includeExtra?: string[],
    includeLinks?: boolean,
};

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

type VingRecordParams<T extends TModelName> = {
    props?: Describe<T>['props'],
    links?: Describe<T>['links'],
    meta?: Describe<T>['meta'],
    options?: Describe<T>['options'],
    related?: Describe<T>['related'],
    query?: QueryParams,
    warnings?: Describe<T>['warnings'],
    createApi?: string | undefined,
    fetchApi?: string | undefined,
    // postFormattingOptions: {}
}

export interface VingRecord<T extends TModelName> {
    props?: Describe<T>['props'],
    links?: Describe<T>['links'],
    meta?: Describe<T>['meta'],
    options?: Describe<T>['options'],
    related?: Describe<T>['related'],
    warnings: Describe<T>['warnings'],
    query?: QueryParams,
    behavior: VingRecordParams<T>,
    setResult(result: Describe<T>): void,
    dispatchWarnings(): void,
    getCreateApi(): string,
    getFetchApi(): string,
    fetch(): Promise<any>,
    _save<K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]): Promise<any>,
    save<K extends keyof Describe<T>['props']>(name: K, value?: Describe<T>['props'][K]): Promise<any>,
    _partialUpdate(props?: Describe<T>['props'], options?: {}): Promise<any>,
    partialUpdate(props?: Describe<T>['props'], options?: {}): Promise<any>,
    update(options?: {}): Promise<any>,
}

export default <T extends TModelName>(behavior: VingRecordParams<T> = { props: {} }) => {

    const VingRecord: VingRecord<T> = {

        props: {},
        links: {},
        meta: {},
        options: {},
        related: {},
        warnings: [],
        query: {},
        behavior: {},

        setResult(result) {
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
            });
            promise.then((response) => {
                const data: Describe<T> = response.data.value as Describe<T>;
                self.setResult(data);
            })
                .catch((response) => {
                    throw response;
                });
            return promise;
        },

        _partialUpdate(props, options: {}) {
            // if we were calling formatPropsBodyData here is where we would call it
            const self = this;

            if (!this.links || !this.links.self) {
                notify.error('No links.self');
                throw ouch(400, 'No links.self');
            }

            const promise = useFetch(this.links.self, {
                query: this.query,
                method: 'put',
                body: props,
            });

            promise.then((response) => {
                const data: Describe<T> = response.data.value as Describe<T>;
                self.setResult(data);
            })
                .catch((response) => {
                    throw response;
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
        }

    }

    VingRecord.behavior = behavior;
    VingRecord.setResult(behavior as Describe<T>);
    VingRecord.query = { includeLinks: true, ...behavior.query };

    return VingRecord;
}