import { VingRecord, VingKind } from "../VingRecord.mjs";
import { useDB } from '../../drizzle/db.mjs';
import { S3FileTable } from '../../drizzle/schema/S3File.mjs';
import { useUsers } from './User.mjs';
import { ouch } from '../../utils/ouch.mjs';
import { v4 } from 'uuid';
import sanitize from 'sanitize-filename';
import * as dotenv from 'dotenv';
dotenv.config();

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

export const getExtension = (filename) => {
    const match = filename.toLowerCase().match(/^.*\.(\w*)$/);
    return match[1];
}

export const sanitizeFilename = (nameIn) => {
    const nameOut = sanitize(nameIn);
    const ext = getExtension(nameOut);
    const allowedExtensions = Object.keys(extensionMap);
    if (!ext)
        throw ouch(415, 'The file does not appear to have a file extension.');
    else if (!(allowedExtensions.includes(ext)))
        throw ouch(415, `The extension ${ext} is not one of the allowed file extensions.`, allowedExtensions);
    return nameOut;
};

export const formatS3FolderName = (input) => {
    return input.replace(/-/g, '/').replace(/^(.{4})(.+)$/, '$1/$2');
}

export const makeS3FolderName = () => {
    return formatS3FolderName(v4());
}

export class S3FileRecord extends VingRecord {

    fileUrl() {
        return `https://${process.env.AWS_UPLOADS_BUCKET}.s3.amazonaws.com/${this.get('s3folder')}/${this.get('filename')}`;
    }

    thumbnailUrl() {
        switch (this.get('icon')) {
            case 'self':
                return this.fileUrl();
            case 'thumbnail':
                return `https://${process.env.AWS_THUMBNAILS_BUCKET}.s3.amazonaws.com/${formatS3FolderName(this.get('id'))}.png`;
            case 'extension': {
                const image = extensionMap[this.extension()] || 'unknown';
                return `/img/filetype/${image}.png`;
            }
            default:
                return '/img/pending.webp';
        }
    }

    extension() {
        return getExtension(this.get('filename'));
    }

    async describe(params = {}) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            if (this.isOwner(params?.currentUser)) {
                out.meta.fileUrl = this.fileUrl();
            }
            out.meta.thumbnailUrl = this.thumbnailUrl();
            out.meta.extension = this.extension();
        }
        return out;
    }

    async postProcessFile() {
        const self = this;
        let response = null;
        let metadata = {};
        try {
            response = await fetch(process.env.LAMBDA_PROCESS_UPLOADS_URL, {
                method: 'POST',
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: self.fileUrl(),
                    thumbnailKey: formatS3FolderName(self.get('id')) + '.png',
                    fileType: self.extension(),
                }),
            });
            metadata = await response.json();
            if (metadata.error) {
                throw ouch(metadata.error.code, metadata.error.message);
            }
        }
        catch (e) {
            self.set('status', 'postProcessingFailed');
            await self.update();
            // future: kick off deletion process
            console.error(`Could not post process ${self.get('id')} because ${response.statusText}`, { response, error: e });
            //console.debug(response);
            throw ouch(504, `Could not post process ${self.get('filename')}.`);
        }
        if (metadata.thumbnail) {
            self.set('icon', 'thumbnail');
            delete metadata.thumbnail;
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

    async verifyExactDimensions(width, height) {
        const metadata = this.get('metadata');
        if (width != metadata.width || height != metadata.height)
            await this.markUnverified(`${this.get('filename')} should be ${width}x${height}, but was ${metadata.width}x${metadata.height}.`);
        return true;
    }

    async verifyExtension(allowedTypes) {
        if (!allowedTypes.includes(this.extension()))
            await this.markUnverified(`${this.get('filename')} needs to be one of ${allowedTypes.join(', ')}.`);
        return true;
    }

    async markUnverified(error) {
        this.set('status', 'verifyFailed');
        await this.update();
        // future: kick off deletion process
        console.log(`S3File ${this.get('id')} unverified because ${error}.`);
        throw ouch('442', error)
    }

    // User - parent relationship
    get user() {
        return useUsers().findOrDie(this.get('userId'));
    }

    // Users that have S3Files attached as avatars.
    get avatarUsers() {
        const users = useUsers();
        users.propDefaults.push({
            prop: 'avatarId',
            field: users.table.avatarId,
            value: this.get('id')
        });
        return users;
    }

}

export class S3FileKind extends VingKind {
    // add custom Kind code here
}

export const useS3Files = () => {
    return new S3FileKind(useDB(), S3FileTable, S3FileRecord);
}