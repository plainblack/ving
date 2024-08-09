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
            auroraSettings: {
                adminUser: 'root',
                minCapacity: 0.5,
                maxCapacity: 2,
                backupRetention: 7, // days
            },
            uploadsBucketNameOverride: 'uploads.somedomainthattotallyexists.com',
            thumbnailsBucketNameOverride: 'thumbnails.somedomainthattotallyexists.com',
        },
    }
};