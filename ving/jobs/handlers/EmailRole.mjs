import ving from '#ving/index.mjs';
import { sendMail } from '#ving/email/send.mjs';
import { useKind } from '#ving/record/utils.mjs';
import { eq } from '#ving/drizzle/orm.mjs';

/**
 * This handler looks up all users with a specified role and sends them an email.
 * @param {Object} job A `BullMQ` job.
 * @param {Object} job.data An object with data needed for this job.
 * @param {string} job.data.role The name of a role on the User record that if true will be sent this email.
 * @param {string} job.data.subject The subject line of the email.
 * @param {string} job.data.summary A very short summary of the message.
 * @param {string} job.data.message The message body of the email.
 * @returns {boolean} `true`
 */
export default async function (job) {
    const users = await useKind('User');
    const roleUsers = await users.findMany(eq(users.table[job.data.role], true));
    ving.log('jobs').info(`${job.id} found ${roleUsers.length} users to send emails to.`);
    let succeeded = 0;
    let failures = 0;
    for (const user of roleUsers) {
        const vars = {
            subject: job.data.subject,
            summary: job.data.summary,
            message: job.data.message,
        };
        try {
            await sendMail('generic', {
                options: { to: user.get('email') },
                vars
            });
            succeeded++;
        }
        catch (err) {
            failures++;
            ving.log('jobs').error(`${job.id} failed to send email to user ${user.get('id')} ${user.get('email')} because ${err.message} with message ${JSON.stringify(vars)}`);
        }
    }
    ving.log('jobs').info(`${job.id} sent ${succeeded} emails with ${failures} failures.`)
    return true;
}