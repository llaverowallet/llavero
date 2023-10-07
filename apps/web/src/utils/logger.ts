import { CloudWatchLogsClient, CreateLogStreamCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";

class CloudWatchLogger {
    private static instance: CloudWatchLogger;
    private cloudwatchlogs: CloudWatchLogsClient;
    private readonly LOG_GROUP_NAME;
    private constructor() {
        this.cloudwatchlogs = new CloudWatchLogsClient({ region: "us-east-1" });
        this.LOG_GROUP_NAME = process.env.LOG_GROUP_NAME ?? "noGroupName-error-check-env-variables";
    }

    public static getInstance(): CloudWatchLogger {
        if (!CloudWatchLogger.instance) {
            CloudWatchLogger.instance = new CloudWatchLogger();
        }
        return CloudWatchLogger.instance;
    }

    public async log(message: string) {
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
        await this.putLog(params);
    }

    public async error(message: string) {
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
        await this.putLog(params);
    }

    private async putLog(params: { logGroupName: string; logStreamName: string; logEvents: { message: string; timestamp: number; }[]; }) {
        const logStreamName = params.logStreamName;
        const logGroupName = params.logGroupName;
        const logEvents = params.logEvents;
        const paramsCreateStream = new CreateLogStreamCommand({
            logGroupName: logGroupName,
            logStreamName: logStreamName
        });
        try {
            await this.cloudwatchlogs.send(paramsCreateStream);
        } catch (err: any) {
            if (err.name !== 'ResourceAlreadyExistsException') {
                console.log("Error creating log stream:", err);
                return;
            }
        }
        const paramsPutLog = new PutLogEventsCommand({
            logGroupName: logGroupName,
            logStreamName: logStreamName,
            logEvents: logEvents
        });
        try {
            const data = await this.cloudwatchlogs.send(paramsPutLog);
            console.log("Logged to CloudWatch:", data);
        } catch (err) {
            console.log("Error logging to CloudWatch:", err);
        }
    }

    private getLogStreamName(): string {
        const now = new Date();
        const minutes = now.getMinutes();
        const roundedMinutes = Math.floor(minutes / 5) * 5;
        const roundedTimeString = roundedMinutes.toString().padStart(2, '0');
        const logStreamName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}-${roundedTimeString}`;
        return logStreamName;
    }
}

export default CloudWatchLogger.getInstance();