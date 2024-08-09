export default {
    shortName: 'ving',
    uploadsBucketName: 'uploads',
    thumbnailsBucketName: 'thumbnails',
    stages: {
        dev: {
            region: 'us-east-1',
            account: '041977924901',
            uploadsLambdaSettings: {
                memorySize: 256, // megabytes
                timeout: 60, // seconds
            },
        },
        prod: {
            region: 'us-east-1',
            account: '041977924901',
            uploadsLambdaSettings: {
                memorySize: 512, // megabytes
                timeout: 60, // seconds
            },
            uploadsBucketNameOverride: 'uploads.ving.com',
            thumbnailsBucketNameOverride: 'thumbnails.ving.com',
        },
    }
};