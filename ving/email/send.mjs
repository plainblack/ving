import Email from 'email-templates';
import { createTransport } from 'nodemailer';
import ving from '#ving/index.mjs';

const emailConfig = new URL(process.env.VING_SMTP || 'smtp://localhost:465');

const defaultTransporter = createTransport({
    host: emailConfig.hostname,
    port: emailConfig.port,
    secure: emailConfig.searchParams.get('tls') === 'yes',
    auth: {
        user: emailConfig.username,
        pass: decodeURIComponent(emailConfig.password),
    },
    attachments: null
});


/**
 * Generate a `nodemailer` transport.
 * 
 * @param {Object} options 
 * @param {string} options.service The name of a service to connect to
 * @param {string} options.host The hostname of an SMTP server
 * @param {number} options.port An integer representing the port of the SMTP server
 * @param {boolean} options.secure Whether to enable TLS or not
 * @param {Object} options.auth An object conntaining authorization data
 * @param {string} options.auth.user A username
 * @param {string} options.auth.pass A password
 * @param {Array} options.attachments An array of attachment objects. 
 * @returns A `nodemailer` transport
 */
export const customTransporter = (options) => {
    return createTransport({
        service: options.service,
        host: options.host,
        port: options.port,
        secure: options.secure,
        auth: options.auth,
        attachments: options.attachments,
    })
}

/**
 * Sends an email via the configured SMTP service
 * 
 * @param {string} template The name of at template folder in `#ving/email/templates`
 * @param {Object} props An object with configuration properties
 * @param {Object} props.vars An object with parameters you want to pass to the template for processing
 * @param {Object} props.options Optional configuration options
 * @param {string} props.options.from The email address to use as the from address. Defaults to the ving site email address.
 * @param {string} props.options.fromName the name of the person sending the email. Defaults to the ving site name.
 * @param {boolean} props.options.preview `true` means display the email, but don't send it, where `false` means the opposite. Defaults to `false`.
 * @param {string} props.options.cc An email address to CC
 * @param {string} props.options.bcc An email address to BCC
 * @param {string} props.options.to An email address to send this message to
 * @param {string} props.options.toName The name of the person receiving this email
 * @param {Array} props.options.attachments An array containing attachments to send along with this email
 * @param {Object} props.transporter A custom `nodemailer` transport
 */
export const sendMail = async (template, props) => {
    const vingConfig = ving.getConfig();
    vingConfig.site.url = process.env.VING_SITE_URL;
    const options = props.options;
    options.from = options.from ?? vingConfig.site.email;
    options.fromName = options.fromName ?? vingConfig.site.name;
    options.preview = options.preview ?? false;
    const customTrasporter = props.transporter;
    const transporter = customTrasporter ?? defaultTransporter;
    await new Email({
        message: {
            from: `${options.fromName} ${options.from}`,
            to: `${options.toName || ''} ${process.env.VING_EMAIL_OVERRIDE ?? options.to}`,
            cc: options.cc,
            bcc: options.bcc,
            attachments: options.attachments
        },
        views: {
            root: './ving/email/templates',
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
                settings: { views: './ving/email/templates/_wrappers' },
                site: vingConfig.site,
            }
        })
        .then((info) => {
            if (emailConfig.searchParams.get('log') === 'yes') {
                ving.log('email').info(`Mail sent successfully!!`);
                ving.log('email').debug(`[MailResponse]=${info.response} [MessageID]=${info.messageId}`);
            }
            return info
        }).catch((err) => {
            ving.log('email').error('Error sending email from ving: ' + err);

            if (err.message.includes('getaddrinfo ENOTFOUND')) {
                ving.log('email').error(`Error Hint: could not connect to host VING_SMTP is set to ${emailConfig.hostname} `);
            }

            return err;
        });
}