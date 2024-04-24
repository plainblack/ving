import { VingRecord, VingKind } from "#ving/record/VingRecord.mjs";
import { v4 } from 'uuid';
import sanitize from 'sanitize-filename';
import { S3Client, DeleteObjectCommand } from '@aws-sdk/client-s3';
import ving from '#ving/index.mjs';

/** A list of supported file extensions and the thumbnail they will be represented by. */
export const extensionMap = {
    mp3: 'audio',
    wav: 'audio',
    js: 'code',
    ts: 'code',
    pl: 'code',
    mjs: 'code',
    cjs: 'code',
    yaml: 'config',
    json: 'config',
    ini: 'config',
    config: 'config',
    css: 'config',
    rtf: 'document',
    pdf: 'document',
    doc: 'document',
    docx: 'document',
    pages: 'document',
    odt: 'document',
    ttf: 'font',
    otf: 'font',
    tif: 'image',
    jpg: 'image',
    jpeg: 'image',
    tiff: 'image',
    gif: 'image',
    png: 'image',
    psd: 'image',
    bmp: 'image',
    xml: 'markup',
    html: 'markup',
    php: 'markup',
    njk: 'markup',
    ppt: 'presentation',
    odp: 'presentation',
    keynote: 'presentation',
    xls: 'spreadsheet',
    csv: 'spreadsheet',
    xlsx: 'spreadsheet',
    ods: 'spreadsheet',
    md: 'text',
    txt: 'text',
    dxf: 'vector',
    svg: 'vector',
    ai: 'vector',
    ps: 'vector',
    mp4: 'video',
    mov: 'video',
    avi: 'video',
    gif: 'video',
    zip: 'archive',
    rar: 'archive',
    gz: 'archive',
    tar: 'archive',
    exe: 'disc',
    dmg: 'disc',
    msi: 'disc',
};

/**
     * Gets a file extension.
     * 
     * @param {string} filename A filename.
     * @returns {string} A file extension
     * @example
     * const extension = getExtension('myimage.jpg')
     */
export const getExtension = (filename) => {
    const match = filename.toLowerCase().match(/^.*\.(\w*)$/);
    return match[1];
}

/**
     * Removes special characters from a filename. Special characters 
     * include /, ?, <, >, \, :, *, |, and " among others. Also checks
     * the filename against `extensionMap`.
     * 
     * @throws 415 if the file doesn't have an extension or has a disallowed extension
     * @param {string} filename A filename.
     * @returns {string} A file extension
     * @example
     * const filename = sanitizeFilename('myimage.jpg')
     */
export const sanitizeFilename = (nameIn) => {
    const nameOut = sanitize(nameIn);
    const ext = getExtension(nameOut);
    const allowedExtensions = Object.keys(extensionMap);
    if (!ext)
        throw ving.ouch(415, 'The file does not appear to have a file extension.');
    else if (!(allowedExtensions.includes(ext)))
        throw ving.ouch(415, `Dear Developer: The extension ${ext} is not one of the allowed file extensions supported by Ving's S3File. Edit the extensionMap to add this file type.`, allowedExtensions);
    return nameOut;
};

/**
     * Formats a UUID as series of folders to be used as an S3 key.
     * 
     * @param {string} input A v4 UUID.
     * @returns {string} A string with slashes splitting the first few characters and all dashes replaced with slashes.
     * @example
     * const folder = formatS3FolderName('0467810a-5d75-4a91-a868-4f87281fbab9')
     */
export const formatS3FolderName = (input) => {
    return input.replace(/-/g, '/').replace(/^(.{4})(.+)$/, '$1/$2');
}

/**
     * Generates a UUID and then formats it using `formatS3FolderName`.
     * 
     * @returns {string} A string with slashes splitting the first few characters and all dashes replaced with slashes.
     * @example
     * const folder = makeS3FolderName()
     */
export const makeS3FolderName = () => {
    return formatS3FolderName(v4());
}

/** A subclass of VingRecord that holds information about files in S3 for use by other Ving Records.
 * @class
 */
export class S3FileRecord extends VingRecord {

    /**
         * Generates the URL to the s3 storage location where this file exists.
         * 
         * @returns {string} A URL to an S3 key.
         * @example
         * const url = s3file.fileUrl()
         */

    fileUrl() {
        return `https://${process.env.VING_AWS_UPLOADS_BUCKET}.s3.amazonaws.com/${this.get('s3folder')}/${this.get('filename')}`;
    }

    /**
         * Generates the URL to the thumbnail for a file or an icon that represents the file.
         * 
         * @returns {string} A URL to an image or icon representing this file.
         * @example
         * const url = s3file.thumbnailUrl()
         */
    thumbnailUrl() {
        switch (this.get('icon')) {
            case 'self':
                return this.fileUrl();
            case 'thumbnail':
                return `https://${process.env.VING_AWS_THUMBNAILS_BUCKET}.s3.amazonaws.com/${formatS3FolderName(this.get('id'))}.png`;
            case 'extension': {
                const image = extensionMap[this.get('extension')] || 'unknown';
                return `/img/filetype/${image}.png`;
            }
            default:
                return '/img/pending.webp';
        }
    }

    /**
     * Generates a description of this S3File beyond the normal VingRecord
     * description. This includes the `meta` fields `fileUrl` and `thumbnailUrl`.
     * 
     * @see VingRecord.describe()
     * @param {Object} params See VingRecord describe for details.
     * @returns {object} An object with the description. See VingRecord for details.
     * @example
     * const description = await s3file.describe()
     */
    async describe(params = {}) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            if (await this.isOwner(params?.currentUser)) {
                out.meta.fileUrl = this.fileUrl();
            }
            out.meta.thumbnailUrl = this.thumbnailUrl();
        }
        return out;
    }

    /**
         * Makes a call out to an AWS Lambda function to do post processing 
         * of the file after upload. It includes collecting metadata, verifying
         * file size, and generating thumbnails as necessary.
         * @throws 500 or other codes depending upon what the Lambda function returns.
         * @example
         * await s3file.postProcessFile()
         */
    async postProcessFile() {
        const self = this;
        if (self.get('status') == 'ready')
            return self.get('metadata');
        let response = null;
        let metadata = {};
        try {
            response = await fetch(process.env.VING_LAMBDA_PROCESS_UPLOADS_URL, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: self.fileUrl(),
                    thumbnailKey: formatS3FolderName(self.get('id')) + '.png',
                    fileType: self.get('extension'),
                }),
            });
            metadata = await response.json();
            if (metadata.error) {
                throw ving.ouch(metadata.error.code, metadata.error.message);
            }
        }
        catch (e) {
            self.set('status', 'postProcessingFailed');
            await self.update();
            ving.log('S3File').error(`Could not post process ${self.get('id')} because ${response.statusText}`);
            ving.log('S3File').debug(JSON.stringify(response));
            throw ving.ouch(504, `Could not post process ${self.get('filename')}.`);
        }
        if (metadata.thumbnail) {
            self.set('icon', 'thumbnail');
            delete metadata.thumbnail;
        }
        else if (self.get('extension') == 'svg') {
            self.set('icon', 'self');
        }
        else {
            self.set('icon', 'extension');
        }
        if (metadata.sizeInBytes) {
            self.set('sizeInBytes', metadata.sizeInBytes);
            delete metadata.sizeInBytes;
        }
        self.set('metadata', metadata);
        self.set('status', 'ready');
        await self.update();
        return metadata;
    }

    /**
         * Checks the dimensions of the image from the metadata and returns 
         * true if they do or calls `markVerifiyFailed()` if they don't.
         * 
         * @param {number} width The width in pixels this image should be.
         * @param {number} height The height in pxiels this image should be.
         * @param {boolean} errorOnly A boolean that if true will skip marking the file as 
         * failing verified and will also skip deletion. Useful when you are allowing
         * reuse of files and don't wish to delete files just due to failing verification
         * in one use case. Defaults to `false`.
         * @throws 442 if the dimensions do not match
         * @returns {boolean} `true` if successful.
         * @example
         * await s3file.verifyExactDimensions(width, height)
         */
    async verifyExactDimensions(width, height, errorOnly = false) {
        const metadata = this.get('metadata');
        if (width != metadata.width || height != metadata.height)
            await this.markVerifiyFailed(`${this.get('filename')} should be ${width}x${height}, but was ${metadata.width}x${metadata.height}.`, errorOnly);
        return true;
    }

    /**
         * Checks the extension of the file against a whitelist and returns 
         * true if they do or calls `markVerifiyFailed()` if they don't.
         * 
         * @param {string[]} whitelist An array of allowed file extensions
         * @param {boolean} errorOnly A boolean that if true will skip marking the file as 
         * failing verified and will also skip deletion. Useful when you are allowing
         * reuse of files and don't wish to delete files just due to failing verification
         * in one use case. Defaults to `false`.
         * @throws 442 if the extension is not in the whitelist
         * @returns {boolean} `true` if successful.
         * @example
         * await s3file.verifyExtension(['png','gif','jpeg','jpg'])
         */
    async verifyExtension(whitelist, errorOnly = false) {
        if (!whitelist.includes(this.get('extension')))
            await this.markVerifiyFailed(`${this.get('filename')} needs to be one of ${whitelist.join(', ')}.`, errorOnly);
        return true;
    }

    /**
         * Generally this would be called by a verify function such as 
         * `verifyExtension` rather than by you directly.
         * 
         * This function sets the status of this file to `verifyFailed`,
         * logs the failure, kicks off a background process to delete
         * the file, then throws a `442`.
         * 
         * @param {string} error A message about why the file is being marked as a failure.
         * @param {boolean} errorOnly A boolean that if true will skip marking the file as 
         * failing verified and will also skip deletion. Useful when you are allowing
         * reuse of files and don't wish to delete files just due to failing verification
         * in one use case. Defaults to `false`.
         * @throws 442
         * @returns {boolean} `true` if successful.
         * @example
         * await s3file.markVerifiyFailed('This file sucks!')
         */
    async markVerifiyFailed(error, errorOnly = false) {
        if (!errorOnly) {
            this.set('status', 'verifyFailed');
            await this.update();
            // future: kick off deletion process
        }
        ving.log('S3File').error(`${this.get('id')} unverified because ${error}.`);
        throw ving.ouch('442', error)
    }

    /**
     * Removes the thumbnail object for this file from S3.
     */
    async deleteThumbnail() {
        if (this.get('icon') == 'thumbnail') {
            const key = formatS3FolderName(this.get('id')) + '.png';
            ving.log('S3File').info(`Deleting thumbnail ${this.get('id')} at ${key}`);
            const command = new DeleteObjectCommand({
                Bucket: process.env.VING_AWS_THUMBNAILS_BUCKET,
                Key: key,
            });
            try {
                const response = await this.#s3client.send(command);
                ving.log('S3File').debug(JSON.stringify(response));
            } catch (err) {
                ving.log('S3File').error(err);
            }
        }
    }

    /**
     * Removes the file object for this file from S3.
     */
    async deleteFile() {
        const key = this.get('s3folder');
        ving.log('S3File').info(`Deleting file ${this.get('id')} at ${key}`);
        const command = new DeleteObjectCommand({
            Bucket: process.env.VING_AWS_UPLOADS_BUCKET,
            Key: key,
        });
        try {
            const response = await this.#s3client.send(command);
            ving.log('S3File').debug(JSON.stringify(response));
        } catch (err) {
            ving.log('S3File').error(err);
        }
    }

    get #s3client() {
        return new S3Client({
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            },
            region: process.env.AWS_REGION,
        });
    }

    /**
         * Extends `delete()` in `VingRecord` to delete the files in s3.
         * 
         * @see VingRecord.delete()
         */
    async delete() {
        await this.deleteThumbnail();
        await this.deleteFile();
        await super.delete();
    }

}

/** A subclass of VingKind that sets up S3FileRecords.
 * @class
 */
export class S3FileKind extends VingKind {
    // add custom Kind code here
}