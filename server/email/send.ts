import Email from 'email-templates';
import { createTransport, Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';
import vingConfig from '../../ving.json';
import * as dotenv from 'dotenv';
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

export type TransporterOptions = {
    service?: string,
    host?: string,
    port?: number,
    secure?: boolean,
    auth?: { user: string, pass: string },
    attachments?: [],
}

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

interface MailInterface {
    from?: string,
    fromName?: string,
    to: string | string[],
    toName?: string,
    cc?: string | string[],
    bcc?: string | string[],
    attachments?: {
        filename: string,
        path: string,
        contentType: string,
    }[],
    preview?: boolean,
}

export type SendMailProps = {
    vars?: Record<string, any>,
    options: MailInterface,
    transporter?: Transporter<SMTPTransport.SentMessageInfo> | null,
}

export const sendMail = async (template: string, props: SendMailProps) => {
    const options = props.options;
    options.from = process.env.EMAIL_TO_OVERRIDE ?? options.from ?? vingConfig.site.email;
    options.fromName = options.fromName ?? vingConfig.site.name;
    options.preview = options.preview ?? false;
    const customTrasporter = props.transporter;
    const transporter = customTrasporter ?? defaultTransporter;
    await new Email({
        message: {
            from: `${options.fromName} ${options.from}`,
            to: `${options.toName || ''} ${options.to}`,
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