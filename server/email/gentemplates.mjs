import { generator, renderTemplate, toFile, after, inject } from '@featherscloud/pinion';
import { splitByCase, kebabCase } from 'scule';

const makeWords = (value) => splitByCase(value).join(' ');

const htmlTemplate = ({ name }) =>
    `{% extends "html-wrapper.njk" %}
    {% block summary %}Summary goes here.{% endblock %}
    {% block content%}
      Main content about <i>${makeWords(name)}</i> <b>goes</b> here.
    {% endblock %}`;

const subjectTemplate = ({ name }) => `${makeWords(name)}`;

const textTemplate = ({ name }) =>
    `{% extends "text-wrapper.njk" %}
    {%- block content -%}Main content about ${makeWords(name)} goes here.{%- endblock -%}`;


export const generateTemplates = (context) =>
    generator(context)
        .then(renderTemplate(htmlTemplate, toFile(`server/email/templates/${kebabCase(context.name)}/html.njk`)))
        .then(renderTemplate(subjectTemplate(context), toFile(`server/email/templates/${kebabCase(context.name)}/subject.njk`)))
        .then(renderTemplate(textTemplate(context), toFile(`server/email/templates/${kebabCase(context.name)}/text.njk`)));

