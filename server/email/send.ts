import Email from 'email-templates';
import { createTransport } from 'nodemailer';
import vingConfig from '../../ving.json';
import * as dotenv from 'dotenv';
import type { TransporterOptions, SendMailProps } from '../../types/email';
dotenv.config();
const emailConfig = new URL(process.env.EMAIL || '');

const defaultTransporter = createTransport({
    host: emailConfig.hostname,
    port: emailConfig.port,
    secure: emailConfig.searchParams.get('tls') === 'yes',
    auth: {
        user: emailConfig.username,
        pass: decodeURIComponent(emailConfig.password),
    },
    attachments: null
} as unknown as TransporterOptions);



export const customTransporter = (options: TransporterOptions) => {
    return createTransport({
        service: options.service,
        host: options.host,
        port: options.port,
        secure: options.secure,
        auth: options.auth,
        attachments: options.attachments,
    })
}


export const sendMail = async (template: string, props: SendMailProps) => {
    const options = props.options;
    options.from = options.from ?? vingConfig.site.email;
    options.fromName = options.fromName ?? vingConfig.site.name;
    options.preview = options.preview ?? false;
    const customTrasporter = props.transporter;
    const transporter = customTrasporter ?? defaultTransporter;
    await new Email({
        message: {
            from: `${options.fromName} ${options.from}`,
            to: `${options.toName || ''} ${process.env.EMAIL_TO_OVERRIDE ?? options.to}`,
            cc: options.cc,
            bcc: options.bcc,
            attachments: options.attachments
        },
        views: {
            root: './server/email/templates',
            options: {
                extension: 'njk',
            },
        },
        send: !options.preview,
        preview: options.preview,
        transport: transporter,
    })
        .send({
            template,
            locals: {
                ...props.vars,
                settings: { views: './server/email/templates/_wrappers' },
                site: vingConfig.site,
            }
        })
        .then((info) => {
            if (emailConfig.searchParams.get('log') === 'yes') {
                console.info(`Mail sent successfully!!`);
                console.info(`[MailResponse]=${info.response} [MessageID]=${info.messageId}`);
            }
            return info
        }).catch((err) => {
            console.error('Error sending email from ving: ' + err);

            if (err.message.includes('getaddrinfo ENOTFOUND')) {
                console.error(`Error Hint: could not connect to host EMAIL is set to ${emailConfig.hostname} `);
            }

            return err;
        });
}