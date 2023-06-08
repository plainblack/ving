import { Job } from 'bullmq';
import { WorkerJob } from '../../../types/agent';

export default function (job: Job<WorkerJob>) {
    console.log('Test ran!');
    return true;
}