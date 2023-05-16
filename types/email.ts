import { Transporter } from 'nodemailer';
import SMTPTransport from 'nodemailer/lib/smtp-transport';

export type TransporterOptions = {
    service?: string,
    host?: string,
    port?: number,
    secure?: boolean,
    auth?: { user: string, pass: string },
    attachments?: [],
}

export interface MailInterface {
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
export type EmailTemplate = { subject: string, html: string, text: string };