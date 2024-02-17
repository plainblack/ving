import { createLogger, format, transports } from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';


export const log = createLogger({
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

if (process.env.NODE_ENV !== 'production') {
    log.add(new transports.Console({
        format: format.cli(),
    }));
}