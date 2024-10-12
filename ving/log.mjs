import { createLogger, format, transports } from 'winston';
//import DailyRotateFile from 'winston-daily-rotate-file';
import WinstonCloudWatch from 'winston-cloudwatch';

/**
 * Creates a `winston` logger and returns it
 * @returns a winston object
 */
export const mainlog = createLogger({
    level: 'info',
    //format: format.combine(format.timestamp(), format.json()),
    /* transports: [
         new DailyRotateFile({
             dirname: './logs',
             filename: 'ving-%DATE%.log',
             datePattern: 'YYYY-MM-DD',
             zippedArchive: true,
             maxSize: '20m',
             maxFiles: '14d'
         })
     ],*/
    format: winston.format.json(),
    transports: [
        new winston.transports.Console(),
        new WinstonCloudWatch({
            logGroupName: 'ving-log-group', // Replace with your CloudWatch log group name
            logStreamName: 'ving-log-stream', // Replace with your CloudWatch log stream name
            awsRegion: 'us-east-1', // Update to your region
            jsonMessage: true
        })
    ]
});

/**
 * Creates a child of the winston `mainlog` that can store a topic
 * @param {string} topic the topic you want to associate with this log entry
 * @returns the logger object
 */
export const log = (topic) => {
    if (!topic) {
        return mainlog;
    }
    return mainlog.child({ topic });
}

if (process.env.NODE_ENV !== 'production') {
    mainlog.add(new transports.Console({
        level: 'debug',
        format: format.cli(),
    }));
}