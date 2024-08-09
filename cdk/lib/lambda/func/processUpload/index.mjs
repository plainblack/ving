import fs from 'fs';
import {
    S3Client,
    PutObjectCommand,
} from "@aws-sdk/client-s3";
import sizeOf from "image-size";
import { PDFDocument } from 'pdf-lib';
import AdmZip from "adm-zip";
import { Readable } from 'stream';
import { finished } from 'stream/promises';
import Jimp from "jimp";

export const handler = async (event) => {
    let input = {};
    let url = '';
    let fileType = '';
    let thumbnailKey = '';
    let out = { "statusCode": 500, "body": { "error": { "code": 500, message: "Failed to start process" } } };
    try {
        input = 'body' in event ? JSON.parse(event.body) : event;
        url = input.url;
        fileType = input.fileType;
        thumbnailKey = input.thumbnailKey;
    }
    catch {
        out = formatError('Unable to initialize post processing, perhaps you did not send a valid json body.')
    }
    try {
        if (['bmp', 'png', 'tiff', 'webp', 'tif', 'psd', 'svg', 'jpeg', 'jpg', 'gif', 'heic', 'heif', 'avci', 'avif', 'icns', 'ico', 'j2c', 'jp2', 'ktx', 'pnm', 'pam', 'pbm', 'pfm', 'pgm', 'ppm', 'tga', 'cur', 'dds'].includes(fileType)) {
            out = formatResponse(await getImageInfo(url, thumbnailKey));
        }
        else if (['pdf'].includes(fileType)) {
            out = formatResponse(await getPdfInfo(url));
        }
        else if (['zip'].includes(fileType)) {
            out = formatResponse(await getZipInfo(url));
        }
        else {
            out = formatResponse(await getOtherFileInfo(url));
        }
    }
    catch (e) {
        console.error(e);
        out = formatError(`Unable to process url ${url} of type ${fileType} for thumbnailKey ${thumbnailKey}, because ${JSON.stringify(e)}`);
    }
    return out;
};


function formatError(message, code = 500) {
    return {
        statusCode: code,
        body: {
            error: {
                code,
                message
            }
        }
    }
}

function formatResponse(body) {
    return {
        statusCode: 200,
        body
    }
}

async function getZipInfo(url) {
    const filePath = await downloadFile(url);
    if (!fs.existsSync(filePath))
        return formatError(`Could not download file from ${url}`);
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();
    const out = { files: [], sizeInBytes: getFileSize(filePath) };
    zipEntries.forEach(function (zipEntry) {
        if (zipEntry.isDirectory || zipEntry.name.match(/^\./))
            return;
        out.files.push({
            name: zipEntry.name,
            size: zipEntry.header.size
        });
    });
    fs.unlinkSync(filePath);
    return out;
}

async function getOtherFileInfo(url) {
    const filePath = await downloadFile(url);
    if (!fs.existsSync(filePath))
        return formatError(`Could not download file from ${url}`);
    const out = { sizeInBytes: getFileSize(filePath) };
    return out;
}

async function getImageInfo(url, thumbnailKey) {
    const filePath = await downloadFile(url);
    if (!fs.existsSync(filePath))
        return formatError(`Could not download file from ${url}`);
    const out = sizeOf(filePath);
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tif', 'tiff'].includes(out.type)) {
        const image = await Jimp.read(filePath);
        await image.resize(out.width > out.height ? 300 : Jimp.AUTO, out.width > out.height ? Jimp.AUTO : 300);
        await image.writeAsync('/tmp/thumbnail.png');
        if (!fs.existsSync('/tmp/thumbnail.png'))
            return formatError(`Could not create thumbnail from ${url}`);
        await uploadThumbnail('/tmp/thumbnail.png', thumbnailKey);
        out.thumbnail = true;
    }
    delete out.type;
    out.sizeInBytes = getFileSize(filePath);
    fs.unlinkSync(filePath);
    return out;
}

async function downloadFile(url) {
    const match = url.match(/^.*\/(.*)$/);
    const fileName = match[1];
    const filePath = '/tmp/' + fileName;
    const stream = fs.createWriteStream(filePath);
    const { body } = await fetch(url);
    await finished(Readable.fromWeb(body).pipe(stream));
    return filePath;
}

async function getPdfInfo(url) {
    const bytes = await fetch(url).then(res => res.arrayBuffer());
    const pdfDoc = await PDFDocument.load(bytes);
    const pages = pdfDoc.getPages();
    return {
        pageCount: pdfDoc.getPageCount(),
        creator: pdfDoc.getCreator(),
        dateCreated: pdfDoc.getCreationDate(),
        dateUpdated: pdfDoc.getModificationDate(),
        width: pages[0].getWidth(),
        height: pages[0].getHeight(),
        sizeInBytes: bytes.byteLength,
    };
}

async function uploadThumbnail(filePath, fileName) {
    const fileContent = fs.readFileSync(filePath);
    const s3Client = new S3Client();
    await s3Client.send(new PutObjectCommand({
        Bucket: process.env.VING_AWS_THUMBNAILS_BUCKET,
        Key: fileName,
        Body: fileContent,
        ContentType: 'image/png',
    }))
};

function getFileSize(filePath) {
    const stats = fs.statSync(filePath);
    return stats.size
}