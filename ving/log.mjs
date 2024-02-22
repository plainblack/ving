import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';


export const mainlog = createLogger({
    level: 'info',
    format: format.combine(format.timestamp(), format.json()),
    transports: [
        new DailyRotateFile({
            dirname: './logs',
            filename: 'ving-%DATE%.log',
            datePattern: 'YYYY-MM-DD-HH',
            zippedArchive: true,
            maxSize: '20m',
            maxFiles: '14d'
        })
    ],
});

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