import { DescribeParams } from '~/utils/db';
export default defineEventHandler((event) => {
    if (event.path !== undefined && event.path.match(/^\/api\//)) {
        const params = getQuery(event);
        const include: DescribeParams['include'] = { options: false, links: false, related: [], extra: [] };
        if ('includeOptions' in params && params.includeOptions !== undefined && params.includeOptions !== null && !Array.isArray(params.includeOptions)) {
            include.options = /^true$/i.test(params.includeOptions as string);
        }
        if ('includeLinks' in params && params.includeLinks !== undefined && params.includeLinks !== null && !Array.isArray(params.includeLinks)) {
            include.links = true;
        }
        if ('includeRelated' in params && params.includeRelated !== undefined && params.includeRelated !== null) {
            if (Array.isArray(params.includeRelated)) {
                include.related = params.includeRelated as string[];
            }
            else if (include.related !== undefined) {
                include.related.push(params.includeRelated as string);
            }
        }
        if ('includeExtra' in params && params.includeExtra !== undefined && params.includeExtra !== null) {
            if (Array.isArray(params.includeExtra)) {
                include.extra = params.includeExtra as string[];
            }
            else if (include.extra !== undefined) {
                include.extra.push(params.includeExtra as string);
            }
        }
        event.context.ving.include = include;
    }
})