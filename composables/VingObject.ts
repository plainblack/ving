import { Describe, DescribeParams, TModelName } from '~/app/db';
import { ouch } from '~/app/helpers';
const notify = useNotifyStore();

export class VingObject<T extends TModelName> {
    constructor(private behavior: {
        props?: Describe<T>['props'],
        links?: Describe<T>['links'],
        meta?: Describe<T>['meta'],
        options?: Describe<T>['options'],
        related?: Describe<T>['related'],
        include?: DescribeParams['include'],
        createApi?: string | undefined,
        fetchApi?: string | undefined,
    } = {
            props: {},
            include: { links: true },
        }
    ) {
        this.props = behavior.props;
        this.links = behavior.links;
        this.meta = behavior.meta;
        this.options = behavior.options;
        this.related = behavior.related;
    }

    public props?: Describe<T>['props'];
    public links?: Describe<T>['links'];
    public meta?: Describe<T>['meta'];
    public options?: Describe<T>['options'];
    public related?: Describe<T>['related'];

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
            query: this.behavior.include,
        });
        promise.then((response) => {
            const data: Describe<T> = response.data.value as Describe<T>;
            self.props = data.props;
            self.links = data.links;
            self.meta = data.meta;
            self.options = data.options;
            self.related = data.related;
        })
            .catch((response) => {
                console.log(response);
                throw response;
            });
        return promise;
    }
}