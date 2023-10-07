import { CloudWatchLogsClient, CreateLogStreamCommand, PutLogEventsCommand } from "@aws-sdk/client-cloudwatch-logs";
import { LOG_STREAM_WINDOW } from "@/utils/constants";

class CloudWatchLogger {
    private static instances: { [name: string]: CloudWatchLogger } = {};
    private cloudwatchLogs: CloudWatchLogsClient;
    private readonly LOG_GROUP_NAME;
    private constructor(private name = "default") {
        this.cloudwatchLogs = new CloudWatchLogsClient({ region: "us-east-1" });
        this.LOG_GROUP_NAME = process.env.LOG_GROUP_NAME ?? "noGroupName-error-check-env-variables";
    }

    public static getInstance(name: string): CloudWatchLogger {
        if (!CloudWatchLogger.instances[name]) {
            CloudWatchLogger.instances[name] = new CloudWatchLogger(name);
        }
        return CloudWatchLogger.instances[name];
    }


    public async log(message: string) {
        const logStreamName = this.getLogStreamName();
        const logEvent = {
            message: this.name + " - " + message,
            timestamp: new Date().getTime(),
        };
        const params = {
            logGroupName: this.LOG_GROUP_NAME,
            logStreamName: logStreamName,
            logEvents: [logEvent],
        };
        await this.putLog(params);
    }

    public async error(error: any, message: string) {
        const logStreamName = this.getLogStreamName();
        const errorMessage = `${this.name} - ERROR: ${message} - ${error.name}: ${error.message}\n${error.stack}`;
        const logEvent = {
            message: errorMessage,
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
            await this.cloudwatchLogs.send(paramsCreateStream);
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
            const data = await this.cloudwatchLogs.send(paramsPutLog);
            console.log("Logged to CloudWatch:", data);
        } catch (err) {
            console.log("Error logging to CloudWatch:", err);
        }
    }

    private getLogStreamName(): string {
        const now = new Date();
        const minutes = now.getMinutes();
        const roundedMinutes = Math.floor(minutes / LOG_STREAM_WINDOW) * LOG_STREAM_WINDOW;
        const roundedTimeString = roundedMinutes.toString().padStart(2, '0');
        const logStreamName = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}-${now.getDate().toString().padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}-${roundedTimeString}`;
        return logStreamName;
    }
}

export default CloudWatchLogger.getInstance;