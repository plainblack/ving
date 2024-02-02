import { defineCommand } from "citty";
import { sendMail } from '../server/email/send.mjs';
import { generateTemplates } from '../server/email/gentemplates.mjs';
import { getContext } from '@featherscloud/pinion';

export default defineCommand({
    meta: {
        name: "Email",
        description: "Useful for testing email",
    },
    args: {
        to: {
            type: "string",
            valueHint: "address",
            description: "Email address to send a test to.",
            alias: 't',
        },
        template: {
            type: "string",
            description: "Template name",
            default: 'test',
            alias: "n",
        },
        preview: {
            type: "boolean",
            description: "Display preview instead of sending",
            default: false,
            alias: 'p',
        },
        create: {
            type: "string",
            description: "Create an email template set with a given name.",
            alias: 'c',
        },
    },
    async run({ args }) {
        if (args.to) {
            await sendMail(args.template, {
                options: { to: args.to, from: 'info@thegamecrafter.com', preview: args.preview },
            });
            console.log('Email sent');
        }
        else if (args.create) {
            await generateTemplates({ ...getContext({}), name: args.create });
        }
    },
});