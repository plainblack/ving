import { VingRecord, VingKind, enum2options } from "#ving/record/VingRecord.mjs";
import { getHandlerNames, addJob } from "#ving/jobs/queue.mjs";

/** Management of individual CronJobs. This is needed, because BullMQ won't allow multiple jobs with the 
 * same schedule to run as cron jobs. So this will execute the `CronJob` handler, which will in turn execute 
 * any number of cron jobs at that same schedule. This also gives a nice administrative UI for managing 
 * cron jobs.
 * @class
 */
export class CronJobRecord extends VingRecord {
    // add custom Record code here

    /**
     * Used with the VingSchema to generate the options for the job handler name.
     * @returns {Array} An array of options for the job handler names
     * @example
     * const options = await cronJob.handlerOptions()
     */
    async handlerOptions() {
        const handlerNames = getHandlerNames();
        const filteredHandlerNames = handlerNames.filter((h) => h != 'CronJob');
        return enum2options(filteredHandlerNames, filteredHandlerNames);
    }

    /**
     * Inserts the current record into the database then adds a BullMQ job to execute the `CronJob` handler.
     * @example
     * await cronJob.insert()
     */
    async insert() {
        await super.insert();
        await addJob('CronJob', { schedule: this.get('schedule') }, { cron: this.get('schedule') });
    }

    /**
     * Updates the current record in the database then adds a BullMQ job to execute the `CronJob` handler.
     * @example
     * await cronJob.update()
     */
    async update() {
        await super.update();
        await addJob('CronJob', { schedule: this.get('schedule') }, { cron: this.get('schedule') });
    }

    // don't need a delete, because the `CronJob` handler will delete the job when it is done if there are no 
    // scheduled jobs with that schedule.

    /**
     * Queues a job for this record.
     * @example
     * await cronJob.queueJob()
     */
    async queueJob() {
        if (this.get('enabled') == true)
            await addJob(this.get('handler'), this.get('params'));
    }
}

/** Management of all CronJobs.
 * @class
 */
export class CronJobKind extends VingKind {
    // add custom Kind code here


}