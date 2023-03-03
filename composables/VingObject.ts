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

export class VingObject<T extends TModelName> {
    constructor(public behavior: {
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
    } = {
            props: {},
        }
    ) {
        this.setResult(behavior as Describe<T>)
        this.dispatchWarnings(behavior.warnings)
        this.query = { includeLinks: true, ...behavior.query };
    }

    public props?: Describe<T>['props'];
    public links?: Describe<T>['links'];
    public meta?: Describe<T>['meta'];
    public options?: Describe<T>['options'];
    public related?: Describe<T>['related'];
    public warnings?: Describe<T>['warnings'];
    public query?: QueryParams;

    public get createApi() {
        if (this.behavior.createApi) {
            return this.behavior.createApi;
        }
        else if (this.behavior.links?.base) {
            return this.behavior.links.base;
        }
        notify.error('No createApi');
        throw ouch(401, 'No createApi');
    }

    public get fetchApi() {
        if (this.behavior.fetchApi) {
            return this.behavior.fetchApi;
        }
        else if (this.behavior.links?.self) {
            return this.behavior.links.self;
        }
        notify.error('No fetchApi');
        throw ouch(401, 'No fetchApi');
    }

    public fetch() {
        const self = this;
        const promise = useFetch(this.fetchApi, {
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
    }

    private setResult(result: Describe<T>) {
        this.props = result.props;
        this.links = result.links;
        this.meta = result.meta;
        this.options = result.options;
        this.related = result.related;
    }

    public _partialUpdate(props?: Describe<T>['props'], options?: {}) {
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
                console.log(response);
                throw response;
            });
        return promise;
    }

    public partialUpdate = _.debounce(function (this: typeof VingObject, props?: Describe<T>['props'], options?: {}) {
        // @ts-ignore - i think the nature of the construction of this method makes ts think there is a problem when there isn't
        return this._partialUpdate(props, options);
    }, 200);

    public update(options?: {}) {
        return this.partialUpdate(this.props, options);
    }

    public dispatchWarnings(list?: Describe<T>['warnings']) {
        if (list) {
            for (const warning of list) {
                document.dispatchEvent(
                    new CustomEvent("wing_warn", {
                        // @ts-ignore
                        message: warning.message,
                    })
                );
                notify.warn(warning.message);
            }
        }

    }

}