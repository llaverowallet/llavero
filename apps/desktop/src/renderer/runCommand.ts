import { spawn, ChildProcessWithoutNullStreams, SpawnOptions } from 'child_process';

export async function executeCommand(
  command: string,
  args: string[],
  directory: string,
  onDataCallback: (data: string) => void,
  envVariables?: NodeJS.ProcessEnv
): Promise<boolean> {
  return new Promise((resolve, reject) => {
    let allData = ''; // Collects all data for error reporting

    const options: SpawnOptions = {
      cwd: directory,
      shell: true,
      env: { ...process.env, ...envVariables } // Merge current process env with the provided ones
    };

    const childProcess: ChildProcessWithoutNullStreams = spawn(command, args, options);

    childProcess.stdout.on('data', (data: Buffer) => {
      const dataStr = data.toString();
      allData += dataStr;
      onDataCallback(dataStr); // Stream data using callback
    });

    childProcess.stderr.on('data', (data: Buffer) => {
      const dataStr = data.toString();
      allData += dataStr;
      onDataCallback(dataStr); // Stream error data using callback
    });

    childProcess.on('close', (code: number) => {
      if (code !== 0) {
        reject(new Error(`Process exited with code ${code}: ${allData}`));
      } else {
        resolve(true);
      }
    });

    childProcess.on('error', (err: Error) => {
      console.error('Error executing command:', err.message);
      reject(err);
    });
  });
}

// // Example usage:

// (async () => {
//   try {
//     const envVars = { CUSTOM_ENV_VARIABLE: "some_value" }; // Define your custom environment variables here

//     await executeCommand('yarn', [], '/path/to/directory', (data) => {
//       console.log(data);  // Stream data to console or to some UI
//     }, envVars);
//     console.log('Finished installing dependencies');

//     await executeCommand('yarn', ['deploy'], '/path/to/directory', (data) => {
//       console.log(data);  // Stream data to console or to some UI
//     }, envVars);
//     console.log('Finished deploying');
//   } catch (err) {
//     console.error('Error executing command:', err.message);
//   }
// })();
