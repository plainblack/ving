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
    const url = event.url;
    const fileType = event.fileType;
    const id = event.id;
    try {
        if (['bmp', 'png', 'tiff', 'webp', 'tif', 'psd', 'svg', 'jpeg', 'jpg', 'gif', 'heic', 'heif', 'avci', 'avif', 'icns', 'ico', 'j2c', 'jp2', 'ktx', 'pnm', 'pam', 'pbm', 'pfm', 'pgm', 'ppm', 'tga', 'cur', 'dds'].includes(fileType)) {
            return formatResponse(await getImageInfo(url));
        }
        else if (['pdf'].includes(fileType)) {
            return formatResponse(await getPdfInfo(url));
        }
        else if (['zip'].includes(fileType)) {
            return formatResponse(await getZipInfo(url));
        }
        return formatError(`File type ${fileType} cannot be processed by this service.`);
    }
    catch {
        return formatError(`Unable to process url ${url} of type ${fileType} for id ${id}.`);
    }
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
    const zip = new AdmZip(filePath);
    const zipEntries = zip.getEntries();
    const out = { files: [] };
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

async function getImageInfo(url) {
    const filePath = await downloadFile(url);
    const out = sizeOf(filePath);
    if (['png', 'jpg', 'jpeg', 'gif', 'bmp', 'tif', 'tiff'].includes(out.type)) {
        Jimp.read(filePath).then(image => {
            image.resize(out.width > out.height ? 300 : Jimp.AUTO, out.width < out.height ? 300 : Jimp.AUTO).write('/tmp/thumbnail.png');
        });
        out.thumbnail = true;
    }
    delete out.type;
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
    };
}

async function uploadThumbnail(filePath, fileName, bucketName) {
    const fileContent = fs.readFileSync(filePath);
    const s3Client = new S3Client({});
    await s3Client.send(new PutObjectCommand({
        Bucket: bucketName,
        Key: fileName,
        Body: fileContent,
        ContentType: 'image/png',
    }))
};