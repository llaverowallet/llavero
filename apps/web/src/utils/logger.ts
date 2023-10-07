import { CloudWatchLogs } from "aws-sdk";
import { get } from "http";


class CloudWatchLogger {
    private static instance: CloudWatchLogger;
    private cloudwatchlogs: CloudWatchLogs;
    private readonly LOG_GROUP_NAME;
    private constructor() {
        this.cloudwatchlogs = new CloudWatchLogs({ region: "us-east-1" });
        this.LOG_GROUP_NAME = process.env.LOG_GROUP_NAME ?? "noGroupName-error-check-env-variables";
    }

    public static getInstance(): CloudWatchLogger {
        if (!CloudWatchLogger.instance) {
            CloudWatchLogger.instance = new CloudWatchLogger();
        }
        return CloudWatchLogger.instance;
    }

    public log(message: string) {
        const logStreamName = this.getLogStreamName();
        const logEvent = {
            message: message,
            timestamp: new Date().getTime(),
        };
        const params = {
            logGroupName: this.LOG_GROUP_NAME,
            logStreamName: logStreamName,
            logEvents: [logEvent],
        };
        this.putLog(params);
    }

    public error(message: string) {
        const logStreamName = this.getLogStreamName();
        const logEvent = {
            message: "ERROR:" + message,
            timestamp: new Date().getTime(),
        };
        const params = {
            logGroupName: this.LOG_GROUP_NAME,
            logStreamName: logStreamName,
            logEvents: [logEvent],
        };
        this.putLog(params);
    }

    /*private putLog(params: { logGroupName: string; logStreamName: string; logEvents: { message: string; timestamp: number; }[]; }) {
        this.cloudwatchlogs.putLogEvents(params, function (err, data) {
            if (err) {
                console.log("Error logging to CloudWatch:", err);
            } else {
                console.log("Logged to CloudWatch:", data);
            }
        });
    }*/

    private getLogStreamName(): string {
        const now = new Date();
        const minutes = now.getMinutes();
        const roundedMinutes = Math.floor(minutes / 5) * 5;
        const roundedTimeString = roundedMinutes.toString().padStart(2, '0');
        const logStreamName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}-${roundedTimeString}`;
        return logStreamName;
    }

    private putLog(params: { logGroupName: string; logStreamName: string; logEvents: { message: string; timestamp: number; }[]; }) {
        const self = this;
        const logStreamName = params.logStreamName;
        const logGroupName = params.logGroupName;
        const logEvents = params.logEvents;
        const paramsCreateStream = {
            logGroupName: logGroupName,
            logStreamName: logStreamName
        };
        this.cloudwatchlogs.createLogStream(paramsCreateStream, function (err, data) {
            if (err) {
                if (err.code !== 'ResourceAlreadyExistsException') {
                    console.log("Error creating log stream:", err);
                    return;
                }
            }
            const paramsPutLog = {
                logGroupName: logGroupName,
                logStreamName: logStreamName,
                logEvents: logEvents
            };
            self.cloudwatchlogs.putLogEvents(paramsPutLog, function (err, data) {
                if (err) {
                    console.log("Error logging to CloudWatch:", err);
                } else {
                    console.log("Logged to CloudWatch:", data);
                }
            });
        });
    }
}

export default CloudWatchLogger.getInstance();