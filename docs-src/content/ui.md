# Web UI
The web user interface of ving allows you to build out complex applications using Vue 3. It starts with [automatically generating pages](ui.html) for your ving records. We use a component library suite called [PrimeVue](https://primevue.org/) that provides all kinds of amazing functionality and a styling library called [PrimeFlex](https://www.primefaces.org/primeflex/) that gives you rich power over CSS. But we've also got a bunch of custom [components](ui.html), [composables](ui.html), and [stores](ui.html) to help you build your app.


## Pages
ving is ultimately built on [Nuxt](https://nuxt.com/), so ving pages can do anything [Nuxt Pages](https://nuxt.com/docs/guide/directory-structure/pages) can do.

You can automatically generate a set of pages for interacting with [ving records](ving-record.html) through the [Rest API](/rest) by using the [CLI](cli.html) like this:

```bash
./ving.ts record --web Foo
```

That will give you a place to start, and then you can use the [composables](ui.html#composables), [components](ui.html#components), and [stores](ui.html#stores) we provide to build out a complex app.

## Components

### AdminNav
Displays the site-wide administrative navigation.

```html
<AdminNav :crumbs="breadcrumbs" />
```

See `Crumbtrail` for more info about the `crumbs` prop.

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
Creates a user interface for uploading [S3Files](S3File.html). It handles the resizing of images on the client side, restriction of file types on the client side, requesting the presigned upload URL, uploading the file to S3. The only thing you need to do is specify via `afterUpload` what happens to the file after the user uploads it.

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

### Pager
Displays a pagination bar for a [useVingKind() result set](ui.html#usevingkind()).

```html
<Pager :kind="users" />
```

Props:

- **kind** - A [useVingKind() object](ui.html#usevingkind()).



## Composables

### useDateTime()
Date formatting tools based upon [date-fns](https://date-fns.org/).
```js
const dt = useDateTime()
const formatted = dt.formateDateTime(new Date());
```

### useRest()
A wrapper around the Nuxt composable `$fetch()` that allows for streamlined fetches, but integrate's with ving's subsystems.

```js
const response = useFetch('/api/user');
```

### useVingKind()
A client for interacting with [server-side ving kinds](ving-record.html#kind-api) through the [Rest API](rest.html).

```js
const users = useVingKind({
    listApi : '/api/user',
    createApi : '/api/user',
    query: { includeMeta: true, sortBy: 'username', sortOrder: 'asc' },
    newDefaults: { username: '', realName: '', email: '' },
});
await users.search();
onBeforeRouteLeave(() => users.dispose());
```

### useVingRecord()
A client for interacting with [server-side ving records](ving-record.html#record-api) through the [Rest API](rest.html).

```js
const id = route.params.id.toString();
const user = useVingRecord<'User'>({
    id,
    fetchApi: '/api/user/' + id,
    createApi: '/api/user',
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

## Stores

TODO: write content