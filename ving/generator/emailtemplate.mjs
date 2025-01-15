import { renderTemplate, toFile, getContext } from '@featherscloud/pinion';
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


export const generateTemplates = (params) => {
    const context = { ...getContext({}), ...params };
    const folderName = kebabCase(context.name);
    return Promise.resolve(context)
        .then(renderTemplate(htmlTemplate, toFile(`ving/email/templates/${folderName}/html.njk`)))
        .then(renderTemplate(subjectTemplate, toFile(`ving/email/templates/${folderName}/subject.njk`)))
        .then(renderTemplate(textTemplate, toFile(`ving/email/templates/${folderName}/text.njk`)));
}