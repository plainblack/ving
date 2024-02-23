import { defineCommand } from "citty";
import { generateTemplates } from '#ving/generator/emailtemplate.mjs';
import ving from '#ving/index.mjs';

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
            ving.sendMail(args.template, {
                options: { to: args.to, from: 'info@thegamecrafter.com', preview: args.preview },
            });
            ving.log('cli').info(`Email sent to ${args.to}`);
        }
        else if (args.create) {
            await generateTemplates({ name: args.create });
        }
        await ving.close();
    },
});