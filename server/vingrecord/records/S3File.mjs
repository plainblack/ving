import { VingRecord, VingKind } from "../VingRecord.mjs";
import { useDB } from '../../drizzle/db.mjs';
import { S3FileTable } from '../../drizzle/schema/S3File.mjs';
import { useUsers } from './User.mjs';
import { v4 } from 'uuid';
import sanitize from 'sanitize-filename';
import * as dotenv from 'dotenv';
dotenv.config();

export const sanitizeFilename = sanitize;

export const formatS3FolderName = (input) => {
    return input.replace(/-/g, '/').replace(/^(.{4})(.+)$/, '$1/$2')
}

export const makeS3FolderName = () => {
    return formatS3FolderName(v4());
}

export class S3FileRecord extends VingRecord {

    get fileUrl() {
        return `https://${process.env.AWS_FILES_BUCKET}.s3.amazonaws.com/${this.s3folder}/${this.filename}`;
    }

    get thumbnailUrl() {
        switch (this.get('icon')) {
            case 'self':
                return this.fileUrl();
            case 'thumbnail':
                return `https://${process.env.AWS_THUMBNAILS_BUCKET}.s3.amazonaws.com/${formatS3FolderName(this.get('id'))}.png`;
            case 'extension':
                return `url to ${this.extension} file`; // also need an unknown extension
            default:
                return 'url to pending icon';
        }
    }

    get extension() {
        const match = this.get('filename').toLowerCase().match(/^.*\.(\w*)$/);
        return match[1];
    }

    async describe(params = {}) {
        const out = await super.describe(params);
        if (params?.include?.meta && out.meta) {
            if (this.isOwner(params?.currentUser)) {
                out.meta.fileUrl = this.fileUrl;
            }
            out.meta.thumbnailUrl = this.thumbnailUrl;
            out.meta.extension = this.extension;
        }
        return out;
    }

    // User - parent relationship
    get user() {
        return useUsers().findOrDie(this.get('userId'));
    }

}

export class S3FileKind extends VingKind {
    // add custom Kind code here
}

export const useS3Files = () => {
    return new S3FileKind(useDB(), S3FileTable, S3FileRecord);
}