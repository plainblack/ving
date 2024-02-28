---
outline: deep
---
# Email
Ving's email system works over SMTP and is defined using templates created via [Nunjucks](https://mozilla.github.io/nunjucks/).

## Setup

Add the following to your `.env` file to be able to send mail. 

```bash
VING_SMTP="smtp://USER:PASS@SERVER:465/?tls=no&log=no"
```

Replace `USER` and `PASS` and `SERVER` with the SMTP username, password, and server name of your SMTP server. You can also change the port from 465 to whatever you like. If it uses TLS then set `tls` to `yes`, and if you want logging enabled you can set `log` to `yes`.

### Overriding Outbound Emails

Add an environment variable to override all outbound emails to an email address of your chosing. 

```bash
VING_EMAIL_OVERRIDE="example@gmail.com"
```

Normally you'd use this in your dev environment so that all your test users email you instead of whatever made up email addresses you might be using. You can add this to your `.env` file.

### Testing
You can test an email template using the [CLI](cli) by typing:

```bash
./ving.mjs email --to=you@gmail.com
```

Add `--preview` to the end if you'd like to display the template in a browser rather than getting the email sent to you.

## Creating an Email Template

Define a template in `server/email/templates`. Each set of templates will go into its own subfolder in that directory, and needs 3 files: `html.njk`, `subject.njk`, and `text.njk`. These can be generated via the CLI:

```bash
./ving.mjs email --create NotifyAboutSweepstakes
```

That will generate a folder with the files you can edit: `server/email/templates/notify-about-sweepstakes`


### Customizing the Headers and Footers

In `server/email/templates/_wrappers` you will find the wrappers for HTML and Text variants of the emails. You can modify those to adjust the default headers and footers applied to all emails.


## Sending an Email

```js
import { sendMail } from '/ving/email/send.mjs';
await sendMail('notify-about-sweepstakes', { // template name matches the folder name
    options: { to: user.get('email') }, 
    vars: {
        foo: 'bar', // put whatever you like here
        color: 'red'
    }
})
```