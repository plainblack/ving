---
outline: deep
---
# Change Log

## January 2025

### 2025-01-21
 * Fixed a bug where undefined tables were added to the drizzle map due to yesterday's fix.
 * Updated to latest drizzle, mysql2, nuxt, primevue, bullmq, and keyv modules.
 * NOTE: Run `npm i` to update your modules.
 * NOTE: PrimeVue now has a component called Form, so the Ving component called Form has been renamed to VForm. You'll need to update all your pages to use VForm. 
 * Fixed: replace db.session.client.pool.end() with db.$client.pool.end() #195

### 2025-01-20
 * Fixed a problem where CLI would try to update the drizzle map when creating a new ving schema.

### 2025-01-15
 * Jobs now automatically retry 3 times and then are aborted.
 * Fixed: job runner not gracefully erroring #198
 * Added better documentation for the job handlers.
 * Added generic email template.
 * Added EmailRole job handler.
 * Aborted jobs now automatically use the EmailRole job handler to email all admins.
 * Fixed CLI docs for email.
 * Fixed the generator deployment location for email templates.

### 2025-01-14
 * Added VingRecord.describeLinks() to generate links for the UI rather than having to manually code them in a describe() override. They are automatically generated for all VingRecords via the CLI, and then pages that are generated also use the exposed links. #179
 * NOTE: You'll need to add a describeLinks() override to classes generated before now.
 * NOTE: S3File's describe() now exposes the links for the file and thumbnail in links.file.href and links.thumbnail.href respectively instead of meta.fileUrl and meta.thumbnailUrl. This is a breaking change.
 * NOTE: User's describe() now exposes the link for the avatar in links.avatarImage.href instead of meta.avatarUrl. This is a breaking change.
 * Implemented: apis should use plurals #183
 * NOTE: rest endpoints and pages use plurals like /users instead of /user now. This is a breaking change. Update your APIs and pages to use plurals.
 * Implemented: page generator should link to parent objects in the statistics section #158
 * Implemented: useCurrentUser() now has isRole() and isaRole() #202
 * Fixed: Inequality with angle brackets <> doesn't work #199

### 2025-01-12
 * Removed pulumi from the project.
 * Fixed: Documentation: useVingRecord findOne docs are wrong #201
 * refactored to use Intl instead of date-fns #204
 * NOTE: If you are using the date formating strings in dateTime.mjs you will need to update them to use Intl instead of date-fns.
 * Fixed: note in docs how to reference drizzle schema #174
 * Removed the ving schema helper `baseSchemaProps` in favor of the new exports `baseSchemaId`, `baseSchemaCreatedAt`, and `baseSchemaUpdatedAt`. This is a breaking change that allows you to modify the base schema props in your schema.
 * NOTE: Update your Ving Schemas to use the new baseSchemaId, baseSchemaCreatedAt, and baseSchemaUpdatedAt exports in place of the baseSchemaProps array. In each of your ving schemas replace this:

```js
        ...baseSchemaProps,
```

With this:

```js
        { ...baseSchemaId },
        { ...baseSchemaCreatedAt },
        { ...baseSchemaUpdatedAt },
```

Also don't forget to update the imports in your schema files.

* Added better error handling for int2str parseId().
* Added stringToNumber option to int2str parseId().
* Added allowRealPubicId to ving schema props.
* Fixed: filter on id #203
* Fixed: How to do a search for hardware ticket by ticket number? #29

## December 2024

### 2024-12-17
 * Added validation to addJob() in jobs/queue.mjs to ensure that data is an object.

## October 2024

### 2024-10-30
 * Fixed: Instead of ouching middleware should call abortNavigation() to prevent navigation.
 * Moved error.vue to app/error.vue.
 * NOTE: If you customized error.vue you'll need to move it to app/error.vue.
 * On the client-side, replaced `ouch()` with the built in `createError()` function.
 * Added stack trace to error.vue.

### 2024-10-28
 * Switched jobs to use redis from a remote cluster.
 * Switched S3File bucket url from app.domain.com.s3.amazonaws.com to s3.amazonaws.com/app.domain.com. And the same for the thumbnail bucket.

### 2024-10-27
* Added ego behavior to useVingRecord() and useVingKind() to allow disambiguation of multiple copies of the same record with different views.
* VingRecord.propOptions() now returns validation options S3File relations in the form of acceptedFileExtensions.
* VingRecord.describe().meta no longer includes the acceptedFileExtensions on S3File relations.
* NOTE: If you are using `record.meta.acceptedFileExtensions` in your UI, you will need to change it to `record.options.relationName` instead. For example `record.meta.acceptedFileExtensions.avatar` would become `record.options.avatar`.

### 2024-10-25
 * Fix a bug in redis client where it wouldn't connect to the AWS valkey/redis cluster.
 * Fix a hydration mismatch in form inputs subtext.
 * Fix a hydration mismatch in markdown inputs.
 * Added error handling to verifyExtension() in S3File.
 * Added validation for acceptedFileExtensions in ving schemas being in the wrong place.
 * Make ioredis quit gracefully.
 * useVingKind().reset() is removed. Use .dispose() instead.

### 2024-10-24
 * Installed dotenv for environment variables.
 * Updated the redis client to use dotenv to get the connection string.
 * Updated the redis client to trap bad connection strings with an error message.
 * Updated the drizzle client to use dotenv to get the connection string.
 * Updated the drizzle client to trap bad connection strings with an error message.
 * Fixed a potential bug where someone enters a negative page number into the paginator.
 * Fixed a bug in the Pager component introduced with the upgrade to PrimeVue 4 where the default page was 0 rather than 1.
 * Updated the redis client to allow for cluster. 
 * Installed keyv-anyredis for cache instead of @keyv/redis.
 * Updated cache to use which allows for cluster and allows us to reuse the existing redis client.
 * NOTE: You will need to run `npm i` to get the new modules.

### 2024-10-01
 * Added colin's patch for mysql pagination.
 * Disabled winston log rotation as it's not compatible with AWS Amplify.

## September 2024

### 2024-09-06
* Added documentation for PM2.

### 2024-09-01
* Created process.json for PM2.

## August 2024

### 2024-08-28
* Added a note about TLS for Redis to the environment variables documentation.

### 2024-08-19
* Started working on the web stack for CDK.
* Updated the database stack to use the secrets manager for the database credentials.

### 2024-08-09
* Started replacing Pulumi with CDK.
* Added a CDK stack for uploads.
* NOTE: Pulumi will be removed in a near future release. Do a `pulumi down; pulumi destroy` to remove the stacks, and then follow the CDK instructions to create recreate the stacks. 
* Added a CDK stack for the database and network.

### 2024-08-07
* Switched to using hooks to copy ving.json to the build directory.

### 2024-08-05
* Added redis to Pulumi prod.

### 2024-08-02
* Added Pulumi prod.
* Pulumi prod creates a VPC.
* Pulumi prod creates a database cluster.

## July 2024

### 2024-07-15
* No longer dynamically loading files for ving records, job handlers, and ving.json as it was causing problems with the Nuxt build process.
* NOTE: Any references you had to ving.useKind() will need to be updated to use useKind() instead, along with an import of it from #ving/record/utils.mjs.
* Created map.mjs files for records, job handlers, and drizzle tables similar to the schema map. These will be updated automatically when you use the CLI generators.
* NOTE: You will need to update the new map.mjs files to reflect any existing records, job handlers, or drizzle tables you have already created. 

### 2024-07-08
* Added CLI `drizzle` command to generate table definitions to the documentation.

### 2024-07-04
* Added `options` param to ving schema props.
* Fixed generating pathing for pages.
* Added Cron Jobs subsystem.
* NOTE: Run a database migration to add the new cronjob table.
* Fixed: Can't have duplicate cron specs in redis. #175

### 2024-07-01
* Added verifiedEmail field to the User CLI.
* Fixed a problem with creating new users via the rest API.
* Fixed: Unable to create Session using the API and following instructions in docs #173

## June 2024

### 2024-06-25
* Disabled nuxt devtools, because I never use them and they are spewing junk into the console.
* Workaround: calling useVingKind().all() when doing an SSR without a middleware causes Nuxt to crash #168

### 2024-06-24
* Fixed: pager appears to be broken #167
* Rewrote the `all` method in useVingKind to be more clear and simple.
* Fixed: itemsPerPage not respected on backend in useVingKind() #169
* Fixed: fix pager component, doesn't currently switch pages #170

### 2024-06-23
* Fixed: examples in VingSchema need to differentiate between the able and the kind class #155
* Implemented: add manifest.json file #162

### 2024-06-21
* Replaced PrimeFlex with Tailwind.
* Replaced PrimeVue 3 with PrimeVue 4.
* NOTE: All your UI stuff will need to be updated to work with Tailwind and PrimeVue 4. 
* Added DarkModeSelector component.
* Added ving-theme.
* Fixed: fix documentation for createAndVerify #164
* Fixed: useKind is treating the cache as if its a class not an instance #165
* Upgraded to Nuxt 3.12.
* NOTE: `npm i` to get the new version of nuxt
* Migrated to new Nuxt 4 folder structure.
* NOTE: All of your pages, layouts, composables, components, utils, middleware, etc needs to move into the app folder.

### 2024-06-06
* Fixed documentation for ving/utils/fs readJSON and writeJSON
* Added an optional function that will be passed to an array filter to filter out any unwanted records from the current list of records on useVingKind() records list.
* Added cron listing to ving jobs list.
* ving jobs list auto-scales to fit terminal size.
* Fixed: Help page type, missing "jobs" #160

### 2024-06-01
* Documented noSetAll() attribute in Ving Schemas.

## May 2024

### 2024-05-31
* Don't do an update if no data has changed when the user calls update().
* Fix enum2labels problem when options list is undefined.
* Added placeholder option to FormInput when type is select so that it autogenerates a default undefined option with the placeholder.

### 2024-05-30
* Fixed and if-else-if bug in FormInput component that was causing fields to be displayed twice if it was an int.
* Fixed translation of ids in Ving Record filters.
* Fixed translation of ints in Ving Record filters.
* If determineDate() is passed an undefined value, it will return new Date().

### 2024-05-26
* Implemented: @click should become @mousedown #154

### 2024-05-22
* Fixed: leaking id in robot avatar #153
* Fixed hydration mismatch on copy to clipboard button.

### 2024-05-14
* Removed extraneous import from rest endpoint.
* Added range() util.

### 2024-05-13
* Changed stringified VingRecord IDs to prefix themselves with their Kind so that they can be easily disambiguated from each other out in the wild. 
* Added a rest endpoint that easily allows deleting of all children of a record.

### 2024-05-12
* Fixed: file uploads are broken after id switch #151
* NOTE: Thumbnails now use a different URL scheme than previously, and thus will be in broken locations. Since we're pre-production, just reupload any images you had.
* Added schema prop validation to not allow the relation name to conflict with a prop name.
* Send user id as an encrypted string over message bus.
* VingRecord now adds an entry to the log every time it throws an error.
* Fixed order of operations lookup on parent after setPostedProps.
* Refined click area of ManageButton and PanelNav buttons.
* Added VueUse composables for reactive access to browser subsystems like keyboard, mouse, localStorage, etc.
* NOTE: Run "npm i" because we've added vueuse as a prereq.
* Added Title tags to every page and the page generator. 
* NOTE: You should Title tags to your pages if you want titles.

### 2024-05-11
* VingRecord id's are now integers for better database performance. They are translated to encrypted strings on the API for better security. 
* NOTE: You will likely want to recreate your database from scratch as all primary and foreign keys are changing from strings to integers, and doing a migration for that is going to be challenging.
* NOTE: You should add a VING_SKIPJACK_KEY to your .env file that takes the format of between 1 and 10 random numbers separated by commas. 
* NOTE: You should run `npm i` as we've added skip32 as a new required module.
* Fixed some email verification corner case problems.
* Removed the findObject() utility as Array.prototype.find() essentially works the same way, and this forces better error handling.
* Removed the token CLI command.
* Added the id CLI command.

### 2024-05-06
* Updated useVingRecord() to allow for extended actions.
* Refactored useCurrentUser() to use useVingRecord()'s new extended actions feature.
* Added some more docs to useVingRecord().

### 2024-05-05
* Fix a bug in the new coerce() logic in FormInput.

### 2024-05-02
* Moved the docs folder from ./docs to ./ving/docs to avoid collisions with downstream projects.
* Created a utils folder for UI utility functions and moved enum2labels() into it since it was never a composable.
* Renamed all composables to start with "use" per Nuxt convention.
* Removed a bunch of extra markup by formatting form controls with their own default bottom margins.
* NOTE: useDateTime() no longer exists, just use formatDate(), formatDateTime(), and formatTimeAgo() directly.
* NOTE: restVersion() has been renamed to useRestVersion(), update your codebase appropriately.
* NOTE: adminLinks() has been renamed to useAdminLinks(), update your codebase appropriately.
* NOTE: useCurrentUserStore() has been renamed to useCurrentUser(), update your codebase appropriately.
* NOTE: useNotifyStore() has been renamed to useNotify(), update your codebase appropriately.
* NOTE: useSystemWideAlertStore() has been renamed to useSystemWideAlert(), update your codebase appropriately.
* NOTE: useThrobberStore() has been renamed to useThrobber(), update your codebase appropriately.
* NOTE: userSettingsButtons() has been renamed to useUserSettingsButtons(), update your codebase appropriately.
* NOTE: userSettingsLinks() has been renamed to useUserSettingsLinks(), update your codebase appropriately.
* Implemented: add "subtext" to FormInput #143
* Implemented: add switch as a type to FormInput #145
* Implemented: eliminate SelectInput in favor of Dropdown #142
* NOTE: Eliminated the prepend/append slots on FormInput. Use spread operator instead.
* NOTE: Eliminated SelectInput. Use Dropdown or FormInput type="select" instead.
* Added prepend/append slots to FormInput for inserting icons into input groups.
* Exposed new props for modifying the classes associated with PanelZone.
* Added a coerce attribute to the FormInput component.
* Added ving util appendNumberToString().

## April 2024

### 2024-04-29
* Implemented: reformat page generator to use panel components on view and edit #139

### 2024-04-28
* Added zod based validation to PanelNav, ManageButton, Crumbtrail components.
* Implemented: Track and update dirty columns only #132
* Fixed a problem where updating an api key wasn't saving.
* Implemented: change @change .update() to .save() #137
* NOTE: Recommend updating your UI components to use .save('propname') instead of .update() on @change events to reduce wire traffic.
* Eliminated p-fluid from all pages as it wasn't necessary and was causing weird button stretching.
* NOTE: Delete p-fluid from all generated pages in your apps.
* NOTE: AdminNav component has been removed. Replaced with useAdminLinks() composable.
* Implemented: reformat admin to use panel components #138

### 2024-04-26
* Removed all the client-only component tags as the hydration mismatches have been fixed.
* Check to make sure a job handler exists before allowing a job to be created.
* Implemented: CLI should let you search for jobs by handler name #125
* Fixed a bug in job worker where it could not error properly from a job handler that didn't exist.
* Fixed: enum should not have a length field in the schema validator #130
* Implemented: in schema validator, disambiguate virtual columns #129
* id type fields in ving schema no longer need a length.
* Added validation for the length attribute on dbVarChar, dbText, and dbMediumText.
* zodText() and zodMediumText() have become deprecated aliases for zodString().
* Implemented: make default a required field in a prop definition #127
* Fixed /api/v1/user/:id/s3files
* Added ManageButton component.
* Added link to user in user admin panel.
* Removed all references to PrimeVue icons as they don't size well with the Iconify icons.
* Replaced UserSettingsNav with PanelNav and useUserSettingsLinks() and useUserSettingsButtons().
* Made the profile editing page mobile friendly.
* Added PanelFrame component which dovetails nicely with PanelNav for building UIs.
* Added PanelZone as a content area for PanelFrame.

### 2024-04-25
* Fixed a bug where ving record fields of type 'int' were not being initialized properly.
* Removed unnecessary validation on Dropzone.
* Upgraded to Nuxt 3.11.2 from 3.10.0.
* Merged VarChar, Text, and MediumText examples in docs into a String Examples section.
* Renamed dbString to dbVarChar, but kept an alias as dbString.
* Built ving schema validation system.
* Fixed a bunch of bugs in the ving schema documentation.
* Moved extensionMap from ving/record/records/S3File.mjs to ving/schema/schemas/S3File.mjs.
* Upgraded from mysql2 3.3.4 to 3.9.7.
* NOTE: run "npm i"

### 2024-04-24
* Fixed a bug where an error when making calls on currentUserStore would destroy existing data.
* Fixed a bug where you couldn't upload an avatar if you didn't already have one.
* Added dxf to the known extension types.
* Added a message for developers that they need to edit the extensionMap if they wish to support a new file type.
* Updated the Dropzone component to use file extensions without a dot, the same way as S3File uses it internally.
* NOTE: Any dropzones you have in use need to be updated to not use a dot in the array of file extensions.
* Implemented: figure out a way to share file extensions for s3files from schema #104
* NOTE: Because of the above you may want to check out the new acceptedFileExtensions attribute in ving schemas and migrate your S3File integrations to use it.
* Implemented: add a display of an s3file thumbnail to the page generator #105
* Fixed: pulumi doesn't create the nodmods.zip file as it should #110
* Added job options for priority, repeat, and cron.
* Added a job handler generator to the CLI.
* Added CLI functions to obliterate, pause, and unpause queues.
* Added CLI functions to list jobs in a queue and kill them.
* Added uniqueQualifiers field to ving schema props to implement: allow unique indexes within set #114

### 2024-04-23
* Created SelectInput component to replace FormSelect. However, you should use FormInput with type select instead of using this directly in most cases.
* NOTE: The FormSelect component no longer exists. Anywhere you are using it use FormInput with type 'select' instead.
* Added size prop to CopyToClipboard button.
* Updated CopyToClipboard in generator to use size xs.
* Added a little better documentation for Pulumi.
* Fix: bio on User is required.
* Implemented: replace axios with ofetch for CLI and jobs #117.
* Implemented: replace lodash defaultsDeep with defu #118
* NOTE: You will have to run npm i to get new modules.
* Added ving/utils/indentify.mjs to help identify various data structures in a more consistent way.
* Refactored entire code base to use ving/utils/indentify.mjs.
* Implemented: replace Usage: with @example in jsdoc #121
* Added more types to JSDoc.

### 2024-04-22
* Added MarkdownInput form control component for editing markdown text.
* Added MarkdownView component for viewing markdown text.
* Integrated MarkdownInput into FormInput component so you can just set "type" equal to "markdown" and display the input.
* Added a `bio` field to the User that can be edited in their profile settings and displayed on their profile page.
* NOTE: Due to the above change you should regenerate your drizzle tables and run a migration.

### 2024-04-20
* Fixed a bug where the rest generator would incorrectly generate child relationship api.
* Added an empty layout.

### 2024-04-19
* Fixed a problem where the default values set by a parent on child records wasn't being respected.
* Update lambda file upload function to handle CSV files and other file types by returning the file size.
* Update S3File Record to allow SVG file uploads and sets the iconf type for files that aren't bitmaps.
* Make useVingRecord aware of extra state.
* Fix count() on VingRecord.

### 2024-04-18
* Cast result of sum() and avg() to number.

### 2024-04-12
* Moved copy() from VingKind to VingRecord as its easier to use and less fragile.

### 2024-04-11
* Made currentUserStore more fault tollerant.
* Implemented: add required to FormSelect #95
* Implemented: unify the use if [id] in urls #101
* NOTE: Due to the above change, you should move [id].get.mjs, [id].put.mjs, and [id].delete.mjs in your server/api/v1/record folders to [id]/index.get.mjs, [id]/index.put.mjs, and [id]/index.delete.mjs.
* Added filesystem utils.
* Updated existing code to use filesystem utils.
* Implemented: add warning when someone generates web or rest without a record #91
* Implemented: user id in statistics and add clipboard copy #88
* Fixed: documentation for Related Records is broken #86
* Implemented: write docs for utils #89
* Fixed: drizzle kit is now interactive #93
* Fixed: cannot dispose useVingRecord on edit page #102
* Added UserAvatar component.
* Added min, max, sum, and avg methods to VingKind.

### 2024-04-10
* Implemented: filterQualifier: true should be in the examples for all relation ids #96
* Implemented: add documentation to ving schema about filterQuery #87
* Added recordsAsOptions() method to the useVingKind() composable.
* Fixed a bug in the create() method of useVingKind & useVingRecord where props passed in to the function would be overridden by the defaults.
* Added prepend and append slots to FormSelect component.
* Fix: int prop didn't generate number form field #92
* Implemented: have page generator add an s3 drop zone if it detects an s3 relationship #100

### 2024-04-09
* Fixed: no type int example in ving schema #82
* Fixed: record delete generator not generating correctly #81
* Fixed: if you misspell a schema when running record -w or record -r it should say no schema, not create an error #80
* Added CopyToClipboard component.
* Implemented: add clipboard button for copying an id to clipboard from view and edit pages #79
* Fixed: displaying cache objects from CLI shows [object Object] instead of the actual object #78
* Fixed: isRoleOrDie not documented correctly #77
* Implemented: document Nuxt stuff #76
* Implemented: add --bare as an option in generators that gets rid of the boiler plate #75
* Implemented: cli improvements #83
* Implemented: document the ving structure #84
* Removed client-only wrapper from Datatables because the upgrade to PrimeVue 3.51.0 fixed the problem it was masking.

### 2024-04-08
* Breaking change: Refactored VingRecord isOwner(), canEdit(), and propsOptions() to be async.
* Added skipOwnerCheck as a ving schema prop relation option.
* Added a whole new section to the Ving Schema documentation defining all the fields that go into ving schema props.
* Added UserProfileLink component.
* Automatically link id/name in generated index pages.
* Update page generator to mark enum options as optional.

### 2024-04-07
* Made the MenuBar in the default layout client only until PrimeVue fixes #5541.
* useVingKind().mint() now carries forward the query params into the new record.
* Updated zodString(), zodText(), and zodMediumText() schema helper to allow for 0 length strings.
* Fixed useVingKind() not settings propsOptions.
* Added enum2label() composable.

### 2024-04-06
* Added VING_SITE_URL to install instructions.
* Fixed API generator missing a slash.
* Fixed API options cassing problem.
* Upgraded to PrimeVue 3.51.0 from 3.47.2.
* Fixed undefined session in delete api.
* Fixed record page generator capitalization.

### 2024-04-05
* Changed the way foreign keys are generated due to the possibility of creating keynames that were too long.
* Added a migration status to the drizzle CLI.

### 2024-04-04
* Provided a little more documentation about virtual columns
* Fixed camelCasing of schema names in the schema generator
* Added mediumtext fields to schema and drizzle generation

## March 2024

### 2024-03-16
* Created a function for fetching ving config in `ving/config.mjs`
* Added a Rest versioning system for API breakages

### 2024-03-15
* Added pseudo props to Records so that in addition to `user.set('admin', true)` you can also do `user.admin = true` for both setters and getters.

### 2024-03-12
* Fixed a security bug where passwords created via the CLI were stored incorrectly.
