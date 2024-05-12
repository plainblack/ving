---
outline: deep
---
# Web UI
The web user interface of ving allows you to build out complex applications using Vue 3. It starts with automatically generating pages for your ving records. We use a component library suite called [PrimeVue](https://primevue.org/) that provides all kinds of amazing functionality and a styling library called [PrimeFlex](https://www.primefaces.org/primeflex/) that gives you rich power over CSS. We also provide access to all of the [VueUse composables](https://vueuse.org/functions.html) for things like reactivity within localStorage, mouse, keyboard, and other browser subsystems. But we've also got a bunch of custom [components](#components) and [composables](#composables) to help you build your app.

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


### CopyToClipboard
Displays a button that allows you to copy a text string to the user's clipboard.

```html
<CopyToClipboard :text="foo"/>
```

Props:

- **text** - The text you wish to copy to the clipboard.
- **size** - The size of the button. Defaults to the normal button size. Can also be `lg`, `sm`, or `xs`.

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

```html
<Dropzone :acceptedFiles="['pdf','zip']" :afterUpload="doThisFunc"></Dropzone>
```
      
Props:

- **acceptedFiles** - An array of file extensions that S3File should accept. Defaults to `['png','jpg']`. This can and should be automatically filled by a `meta.acceptedFileExtensions` property from a [Ving Record](ving-record) when dealing with S3Files. It is set by the `relation.acceptedFileExtensions` attribute in a [Ving Schema](ving-schema). For example:

```html
<Dropzone :acceptedFiles="user.meta?.acceptedFileExtensions?.avatar" />
```
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
Generate the appropritate form field based upon input types. This also handles labeling and error handling in an automated fashion, and thus is generally preferable to using the individual form inputs.

```html
<FormInput name="username" v-model="user.username" />
```

Props:

- **label** - A form label for proper ARIA compliance.
- **type** - Defaults to `text` but can also be `textarea`, `password`, `number`, `markdown`, `select`, `switch` or `email`.
- **name** - The field name for the form input. Required.
- **id** - Defaults to whatever the `name` field is set to, but can be any string.
- **subtext** - Add a small message beneath the field. Note, only shows if the field is not required, or is required and has a value, or isn't invalid. 
- **append** - Appends an input group to the end of the field. Example: `.00`
- **prepend** - Prepends an input group to the front of the field. Example `$`
- **autocomplete** - Sets the browser's autocomplete settings for password fillers and whatnot. Defaults to `off`.
- **v-model** - What Vue reactive variable should this be connected to? Required.
- **placeholder** - Text to be displayed if the input is empty.
- **required** - A boolean that defaults to `false`, but if true will not allow the form to be sent if empty.
- **step** - An amount to increment a `number` type field. Defaults to `1`.
- **options** - An array of objects that is used when type is `select`:
    - **label** - The human readable label for the value.
    - **value** - The value to select. Can be string, number, or boolean.
- **mustMatch** - An object containing:
    - **field** - A label for a field or some other attribute such as `Password`. 
    - **value** - The value that this field must match.
- **class** - A CSS class that should be applied to the field.
- **coerce** - A function that accepts a the value of this field, manipulates it in some way, and returns it. By default it just returns the value as it is entered.

Slots:

- **prepend** - Same thing as the prepend property above, but allows you to insert HTML not just text.
- **append** - Same thing as the append property above, but allows you to insert HTML not just text.

### FormLabel
An ARIA compliant label for a form field. In general you wouldn't use this directly, but via the `label` prop of `FormInput`.

```html
<FormLabel id="foo" label="Foo" />
```

Props:
- **label** - The text to display to the user.
- **id** - The unique id of the form field this label refers to.


### ManageButton
Sometimes you need to list a bunch of management functions in a tight space, like in a DataTable. This component does exactly that. 

```html
<ManageButton severity="primary" :items="[
    { icon:'ph:eye', label:'View', to:`/foo`},
    { icon:'ph:pencil', label:'Edit', to:`/foo/edit`},
    { icon:'ph:trash', label:'Delete', action: () => { console.log('delete me')}}
    ]" /> 
```

Props:
- **severity** - Required. Must be one of `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, or `contrast`.
- **items** - An array of objects. The first item in the list will be used as the primary button, where subsequent items will be used as submenu items.
    - **icon** - Required. A Iconify icon code.
    - **label** - Required. The text to display to the user.
    - **to** - Optional. A URL to link to.
    - **action** - Optional. A function that will trigger on click.



### MarkdownInput
An input control for a markdown editor. In general you shouldn't use this directly, but rather use the `FormInput` control with type of `markdown`.

Props:

- **id** - A required string that is unique on the page.
- **v-model** - A reference to the field that will be edited.
- **placeholder** - A string to display before there is any text.

```html
<MarkdownInput v-model="description" id="foo" />
```

### MarkdownViewer
A display mechanism for markdown that is generated by `MarkdownInput`, which converts the markdown into HTML.

Props:

- **text** - The text containing the markdown you'd like to convert into HTML.

```html
<MarkdownView :text="description" />
```

### Notify
Place this in your layouts so that users can receive toasts that will be triggered via the `useNotify()` composable.
```html
<Notify/>
```

### Pager
Displays a pagination bar for a [useVingKind() result set](#usevingkind).

```html
<Pager :kind="users" />
```

Props:

- **kind** - A [useVingKind() object](#usevingkind).


### PanelFrame
Build a mobile first UI with this layout mechanism combined with `PanelNav`.

```html
<PanelFrame>
    <template #left>
        <PanelNav :links="links" :buttons="buttons" />
    </template>
    <template #content>
        <PanelZone title="Foo">
            Bar
        </PanelZone>
    </template>
</PanelFrame>
```

Slots:
- **left** - A space on the left (or top in mobile) for a nav.
- **right** - A space on the right (or bottom in mobile) for a nav.
- **content** - A space in the middle for your content.

Props:
- **title** - Display a title.
- **section** - Display a title over the left nav.


### PanelNav
Generates a vertical panel on large screens and a horizontal one on small screens to be used as navigation in an application group.

```html
<PanelNav
    :links="[
        { icon:'ph:eye', label:'Foo', to:`/foo`},
        { icon:'ph:pencil', label:'Bar', to:`/bar`},
    ]" 
    :buttons="[
        { icon:'ph:door', label:'Log Out', to:`/out` severity:'primary'},
        { icon:'ph:trash', label:'Delete', action: () => { console.log('delete me')}, severity:'danger' }
    ]" 
    /> 
```

Props:
- **links** - An array of objects to be displayed as links. 
    - **icon** - Required. A Iconify icon code.
    - **label** - Required. The text to display to the user.
    - **to** - Optional. A URL to link to.
- **buttons** - An array of objects to be displayed as buttons.
    - **icon** - Required. A Iconify icon code.
    - **label** - Required. The text to display to the user.
    - **severity** - Required. Must be one of `primary`, `secondary`, `success`, `warning`, `danger`, `info`, `help`, or `contrast`.
    - **to** - Optional. A URL to link to.
    - **action** - Optional. A function that will trigger on click.

### PanelZone
A content area for a `PanelFrame`.

```html
<PanelZone title="Foo" info="Stuff about foo.">
    <div>
       Content goes here
    </div>
</PanelZone>
```

Slots:
- **default** - Content.
- **header** - Replace the entire header.

Props:
- **title** - Display a title in the header.
- **info** - Give the header a little subtext.
- **look** - Override the PanelZone class, which defaults to `surface-card border-1 surface-border border-round`.
- **margin** - Override the PanelZone margin class which defaults to `mb-4`.
- **padding** - Override the PanelZone margin class which defaults to `p-4 pt-3`.


### SystemWideAlert
Place this in your layouts where you would like the system wide alert to be displayed when an admin has configured one. It is triggered by the `useSystemWideAlert()` composable.
```html
<SystemWideAlert/>
```

### Throbber
Place this in your layouts so the user has an indication that there are some background activites such as rest calls happening. It is triggered by the `useThrobber()` composable.
```html
<Throbber />
```


### UserAvatar
Displays the user's avatar next to their display name.

```html
<UserAvatar :user="user" />
```

### UserProfileLink
Wraps the `UserAvatar` component in a `NuxtLink` pointing to the user's profile page.

```html
<UserProfileLink :user="user" />
```

## Composables
Composables are reactive data functions that can only be used in script setup, other composables, or lifecycle hooks. 

>Each of these also has documentation of how to use them in the form of JSDocs in the source code.

### useAdminLinks()
Returns a data structure for use with the `PanelNav` component.

```js
const links = useAdminLinks();
```

### useCurrentUser()
Gets you the currently logged in user. 

```js
const user = useCurrentUser();
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


### useMessageBus()
Connects the browser to the server's [message bus](messagebus). It establishes a connection between your browser and the server, so it needs to be installed in an `onMounted()` handler in your layouts.
```js
onMounted(() => {
    useMessageBus();
})
```

### useNotify()
Allows you to notify the user via toasts. 

```js
    const notify = useNotify();
    notify.info('Just wanted to let you know');
    notify.warn('You might want to get concerned');
    notify.error('Be afraid');
    notify.success('Totally did it');
    notify.notify('info', 'Hello');
```
You would then use the Notify Component in your layout.
```html
<Notify />
```

### useRest()
A wrapper around the Nuxt composable `$fetch()` that allows for streamlined fetches, but integrate's with ving's subsystems.

```js
const response = useFetch(`/api/${useRestVersion()}/user`);
```

### useRestVersion()
Returns the current rest version number from `ving.json` for when you are manually specifying URLs to rest services. such as this:

```
useRest(`/api/${useRestVersion()}/user`);
```

### useUserSettingsButtons()
Returns a data structure for use with the `PanelNav` component.

```js
const buttons = useUserSettingsButtons();
```

### useUserSettingsLinks()
Returns a data structure for use with the `PanelNav` component.

```js
const links = useUserSettingsLinks();
```

### useSystemWideAlert()
Generally not something you'd need to use, but you will interact with it through the admin UI for the system wide alert, but it is used by the `SystemWideAlert` component.

```js
const swa = useSystemWideAlert();
onMounted(async () => {
    swa.check();
}
```


### useThrobber()
Whenever there is an interaction with the API via the `useRest()` composable it will update the throbber store. It is then used by the `Throbber` component.

You may also wish to trigger it for other background actions that are happening so that your user knows something is going on at the moment. Maybe if you're processing a file for export, or if you have some heavy calculations going on, or if you're waiting on a web worker.

```js
    const throbber = useThrobber();
    throbber.working();
    throbber.done();
```


### useVingKind()
A client for interacting with [server-side ving kinds](ving-record#kind-api) through the [Rest API](rest).

```js
const users = useVingKind({
    listApi : `/api/${useRestVersion()}/user`,
    createApi : `/api/${useRestVersion()}/user`,
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
    fetchApi: `/api/${useRestVersion()}/user/${id}`,
    createApi: `/api/${useRestVersion()}/user`,
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

## Utilities
These are UI utility functions that will make your life easier.

>Each of these also has documentation of how to use them in the form of JSDocs in the source code.


### Date Formatting
Date formatting tools based upon [date-fns](https://date-fns.org/).
```js
determineDate("2012-04-23T18:25:43.511Z") // a Date() object
formatDateTime(new Date()) // August 2, 2023 at 4:03pm
formatDate(new Date()) // August 2, 2023
formatTimeAgo("2012-04-23T18:25:43.511Z") // 3 years ago
```

### enum2label()
Converts an enum value into an emum label as defined in a ving schema.

```js
enum2label(enum2label('archived', [{value: 'archived', label:'Is Archived'}, {value: 'not_archived', label:'Not Archived'}]))
```
