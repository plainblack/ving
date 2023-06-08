import { SQL } from '../server/drizzle/orm';
import { SendMailProps } from './email'
export type WorkerJob =
    | {
        /** union discriminated by type `EmailAllUsers` */
        type: 'EmailAllUsers',
        /** data unique to this job */
        data: {
            /** a where clause, if any, to differentiate which users to send this message to */
            where?: SQL,
            /** the name of the template, defaults to 'generic' */
            template?: string,
            /** email template vars for the template */
            vars: SendMailProps['vars']
        }
    }
    | {
        /** union discriminated by type `Test` */
        type: 'Test',
        /** data unique to this job */
        data: {
        }
    }