---
outline: deep
---
# Web UI
The web user interface of ving allows you to build out complex applications using Vue 3. It starts with automatically generating pages for your ving records. We use a component library suite called [PrimeVue](https://primevue.org/) that provides all kinds of amazing functionality and a styling library called [PrimeFlex](https://www.primefaces.org/primeflex/) that gives you rich power over CSS. But we've also got a bunch of custom [components](#components) and [composables](#composables) to help you build your app.

## Layouts
The design of your site is created using [Nuxt Layouts](https://nuxt.com/docs/guide/directory-structure/layouts). You can find the default layout in `layouts/default.vue`.

## Pages
ving is ultimately built on [Nuxt](https://nuxt.com/), so ving pages can do anything [Nuxt Pages](https://nuxt.com/docs/guide/directory-structure/pages) can do.

You can automatically generate a set of pages for interacting with [ving records](ving-record) through the [Rest API](rest) by using the [CLI](cli) like this:

```bash
./ving.mjs record --web Foo
```

> Note that you will need a [Ving Schema](ving-schema), [Ving Record](ving-record), and [Rest](rest) for `Foo` before the web interface can function.

That will give you a place to start, and then you can use the [composables](#composables) and [components](#components) we provide to build out a complex app.

## Icons
The Ving UI makes use if the Nuxt Icon module (which behind the scenes uses the Iconify library), which joins together many different icon libraries to give you [a big selection of icons](https://icon-sets.iconify.design).

For example, the code for a gear icon could be: `mdi:gear`. And then to display that icon you could do:

```html
    <Icon name="mdi:gear" color="red" />
```

## Components

You can use [any of the built in Nuxt components](https://nuxt.com/docs/api/components/client-only), or [one of the 200 components from PrimeVue](https://primevue.org/autocomplete/) or these custom Ving components:

### AdminNav
Displays the site-wide administrative navigation.

```html
<AdminNav :crumbs="breadcrumbs" />
```

See `Crumbtrail` for more info about the `crumbs` prop.

### CopyToClipboard
Displays a button that allows you to copy a text string to the user's clipboard.

```html
<CopyToClipboard :text="foo"/>
```

### Crumbtrail
Displays a crumbtrail navigation.

```html
<Crumbtrail :crumbs="breadcrumbs" />
```

Props:

- **crumbs** - An array of objects containing:
    - **label** - A string for the page name.
    - **to** - A string of the page to navigate to.


### Dropzone
Creates a user interface for uploading [S3Files](/rest/S3File). It handles the resizing of images on the client side, restriction of file types on the client side, requesting the presigned upload URL, uploading the file to S3. The only thing you need to do is specify via `afterUpload` what happens to the file after the user uploads it.

Note that you should always wrap this in a `<client-only>` tag.

```html
<client-only>
    <Dropzone :acceptedFiles="['.pdf','.zip']" :afterUpload="doThisFunc"></Dropzone>
</client-only>
```
      
Props:

- **acceptedFiles** - An array of file extensions that S3File should accept. Note that these should be prepended with a `.` like `.jpg` not `jpg`. Defaults to `['.png','.jpg']`.
- **afterUpload** - Required. A function that will be executed after upload. This function should then call the appropriate import endpoint to post process and verify the file.
- **info** - A string that will be displayed inside the dropzone box. Useful to give the user some insights about the nature of the files you will allow such as size or dimension contstraints. 
- **maxFiles** - An integer of the maximum number of files the user is allowed to select for upload. Defaults to unlimited.
- **maxFilesize** - An integer of the maximum file size in bytes that the user is allowed to upload. Defaults to `100000000`.
- **resizeHeight** - The height in pixels to resize the uploaded image to. Defaults to leaving the size as it is.
- **resizeMethod** - How should a resize of an uploaded image happen? The first option is `contain`, which is the default, and that means that the image will retain its aspect ratio, but will not exceed the bounds of `resizeWidth` and `resizeHeight`. The second option is `crop` which will crop the middle portion of the image to the bounds of `resizeWidth` and `resizeHeight` and discard anything outside those bounds.
- **resizeQuality** - A float representing a percentage of quality that should be applied when resizing `jpg` and `webp` images during upload. `0.6` would represent 60% quality. Defaults to `1`.
- **resizeWidth** - The width in pixels to resize the uploaded image to. Defaults to leaving the size as it is.




### FieldsetItem
A fieldset element within a `FieldsetNav`.

```html
<FieldsetItem name="Foo">
Forms go here...
</FieldsetItem>
```

Props:

- **name** - The name of the field set.

### FieldsetNav
An inline page nav for a large scrollable form to be divided up into sections using `FieldsetItem`.

```html
<FieldsetNav>
    <FieldsetItem name="Content">...</FieldsetItem>
    <FieldsetItem name="Taxonomy">...</FieldsetItem>
    <FieldsetItem name="Privileges">...</FieldsetItem>
</FieldsetNav>
```

### Form
A form element to allow coordination of validation of inputs.
```html
<Form :send="someFunc()">...</Form>
```

Props:

- **send** - A function that should be executed once the form is sumbmitted and fields have been validated.

### FormInput
Generate the appropritate form field based upon input types.

```html
<FormInput name="username" v-model="user.username" />
```

Props:

- **label** - A form label for proper ARIA compliance.
- **type** - Defaults to `text` but can also be `textarea`, `password`, `number`, or `email`.
- **name** - The field name for the form input. Required.
- **id** - Defaults to whatever the `name` field is set to, but can be any string.
- **append** - Appends an input group to the end of the field. Example: `.00`
- **prepend** - Prepends an input group to the front of the field. Example `$`
- **autocomplete** - Sets the browser's autocomplete settings for password fillers and whatnot. Defaults to `off`.
- **v-model** - What Vue reactive variable should this be connected to? Required.
- **placeholder** - Text to be displayed if the input is empty.
- **required** - A boolean that defaults to `false`, but if true will not allow the form to be sent if empty.
- **step** - An amount to increment a `number` type field. Defaults to `1`.
- **mustMatch** - An object containing:
    - **field** - A label for a field or some other attribute such as `Password`. 
    - **value** - The value that this field must match.
- **class** - A CSS class that should be applied to the field.


### FormLabel
An ARIA compliant label for a form field.

```html
<FormLabel id="foo" label="Foo" />
```

Props:
- **label** - The text to display to the user.
- **id** - The unique id of the form field this label refers to.


### FormSelect
A form select list.

```html
<FormSelect>
```

Props:

- **label** - The text label to display to the user.
- **id** - The unique id of the form field. Defaults to whatever is in the `name` field.
- **v-model** - What Vue reactive variable should this be connected to? Required.
- **name** - The field name for the form input. Required.
- **options** - An array of objects:
    - **label** - The human readable label for the value.
    - **value** - The value to select. Can be string, number, or boolean.

### Notify
Place this in your layouts so that users can receive toasts that will be triggered via the `useNotifyStore()` composable.
```html
<client-only>
    <Notify/>
</client-only>
```

### Pager
Displays a pagination bar for a [useVingKind() result set](#usevingkind).

```html
<Pager :kind="users" />
```

Props:

- **kind** - A [useVingKind() object](#usevingkind).

### SystemWideAlert
Place this in your layouts where you would like the system wide alert to be displayed when an admin has configured one. It is triggered by the `useSystemWideAlertStore()` composable.
```html
<client-only>
    <SystemWideAlert/>
</client-only>
```

### Throbber
Place this in your layouts so the user has an indication that there are some background activites such as rest calls happening. It is triggered by the `useThrobberStore()` composable.
```html
<client-only>
    <Throbber />
</client-only>
```

### UserProfileLink
Creates a link to a user profile including the user's avatar.

```html
<UserProfileLink :user="user" />
```

### UserSettingsNav
Navigation for user settings.

```html
<UserSettingsNav />
```

## Composables
Each of these also has documentation of how to use them in the form of JSDocs in the source code.

### currentUserStore()
Gets you the currently logged in user. 

```js
const user = useCurrentUserStore();
if (await user.isAuthenticated()) {
    // do logged in user stuff
}
```

It also triggers 2 window events for when the user logs in or out.

```js
    window.addEventListener('ving-login', (event) => {
        // do something after login
    });
    window.addEventListener('ving-logout', (event) => {
        // do something after logout
    });
```

### enum2label()
Converts an enum value into an emum label as defined in a ving schema.

```js
const label = enum2label(enum2label('archived', [{value: 'archived', label:'Is Archived'}, {value: 'not_archived', label:'Not Archived'}]))
```

### restVersion()
Returns the current rest version number from `ving.json` for when you are manually specifying URLs to rest services. such as this:

```
useRest(`/api/${restVersion()}/user`);
```

### useDateTime()
Date formatting tools based upon [date-fns](https://date-fns.org/).
```js
const dt = useDateTime()
const date = dt.determineDate("2012-04-23T18:25:43.511Z");
const formattedDateTime = dt.formateDateTime(new Date());
const formattedDate = dt.formateDate(new Date());
const timeago = dt.formatTimeAgo("2012-04-23T18:25:43.511Z");
```

### useMessageBus()
Connects the browser to the server's [message bus](messagebus). It establishes a connection between your browser and the server, so it needs to be installed in an `onMounted()` handler in your layouts.
```js
onMounted(() => {
    useMessageBus();
})
```

### useNotifyStore()
Allows you to notify the user via toasts. 

```js
    const notify = useNotifyStore();
    notify.info('Just wanted to let you know');
    notify.warn('You might want to get concerned');
    notify.error('Be afraid');
    notify.success('Totally did it');
    notify.notify('info', 'Hello');
```
You would then use the Notify Component in your layout.
```html
<client-only>
    <Notify />
</client-only>
```

### useRest()
A wrapper around the Nuxt composable `$fetch()` that allows for streamlined fetches, but integrate's with ving's subsystems.

```js
const response = useFetch(`/api/${restVersion()}/user`);
```

### useSystemWideAlertStore()
Generally not something you'd need to use, but you will interact with it through the admin UI for the system wide alert, but it is used by the `SystemWideAlert` component.

```js
const swa = useSystemWideAlertStore();
onMounted(async () => {
    swa.check();
}
```


### useThrobberStore()
Whenever there is an interaction with the API via the `useRest()` composable it will update the throbber store. It is then used by the `Throbber` component.

You may also wish to trigger it for other background actions that are happening so that your user knows something is going on at the moment. Maybe if you're processing a file for export, or if you have some heavy calculations going on, or if you're waiting on a web worker.

```js
    const throbber = useThrobberStore();
    throbber.working();
    throbber.done();
```


### useVingKind()
A client for interacting with [server-side ving kinds](ving-record#kind-api) through the [Rest API](rest).

```js
const users = useVingKind({
    listApi : `/api/${restVersion()}/user`,
    createApi : `/api/${restVersion()}/user`,
    query: { includeMeta: true, sortBy: 'username', sortOrder: 'asc' },
    newDefaults: { username: '', realName: '', email: '' },
});
await users.search();
onBeforeRouteLeave(() => users.dispose());
```

### useVingRecord()
A client for interacting with [server-side ving records](ving-record#record-api) through the [Rest API](rest).

```js
const id = route.params.id.toString();
const user = useVingRecord<'User'>({
    id,
    fetchApi: `/api/${restVersion()}/user/${id}`,
    createApi: `/api/${restVersion()}/user`,
    query: { includeMeta: true, includeOptions: true },
    onUpdate() {
        notify.success('Updated user.');
    },
    async onDelete() {
        await navigateTo('/user/admin');
    },
});
await user.fetch()
onBeforeRouteLeave(() => user.dispose());
```