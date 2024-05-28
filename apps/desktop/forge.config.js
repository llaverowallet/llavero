const path = require('path');
const fs = require('fs');
const { spawn } = require('child_process');

module.exports = {
  hooks: {
    packageAfterPrune: async (config, buildPath, electronVersion, platform, arch) => {
      console.log("Executing packageAfterPrune hook..."); // Log statement to confirm hook execution

      const commands = [
        "add",
        "serialport",
      ];

      return new Promise((resolve, reject) => {
        const oldPckgJson = path.join(buildPath, "package.json");
        const newPckgJson = path.join(buildPath, "_package.json");

        fs.renameSync(oldPckgJson, newPckgJson);

        const yarnAdd = spawn("yarn", commands, {
          cwd: buildPath,
          stdio: "inherit",
          shell: true,
        });

        yarnAdd.on("close", (code) => {
          console.log("yarn add serialport command executed with code:", code); // Log statement to confirm yarn add execution

          if (code === 0) {
            fs.renameSync(newPckgJson, oldPckgJson);

            if (platform === "win32") {
              const problematicPaths = [
                "android-arm",
                "android-arm64",
                "darwin-x64+arm64",
                "linux-arm",
                "linux-arm64",
                "linux-x64",
              ];

              problematicPaths.forEach((binaryFolder) => {
                fs.rmSync(
                  path.join(
                    buildPath,
                    "node_modules",
                    "@serialport",
                    "bindings-cpp",
                    "prebuilds",
                    binaryFolder
                  ),
                  { recursive: true, force: true }
                );
              });
            }

            // Log the contents of node_modules to verify presence of all expected modules
            fs.readdir(path.join(buildPath, "node_modules"), (err, files) => {
              if (err) {
                console.error("Error reading node_modules directory:", err);
              } else {
                console.log("Contents of node_modules:", files);
                // Check if "@aws-cdk/cloudformation-diff" is present
                if (files.includes("@aws-cdk")) {
                  fs.readdir(path.join(buildPath, "node_modules", "@aws-cdk"), (err, awsCdkFiles) => {
                    if (err) {
                      console.error("Error reading @aws-cdk directory:", err);
                    } else {
                      console.log("Contents of @aws-cdk:", awsCdkFiles);
                      // Check if "cloudformation-diff" is present
                      if (awsCdkFiles.includes("cloudformation-diff")) {
                        console.log("@aws-cdk/cloudformation-diff module is present");
                      } else {
                        console.error("@aws-cdk/cloudformation-diff module is missing");
                      }
                    }
                  });
                } else {
                  console.error("@aws-cdk directory is missing");
                }
              }
            });

            resolve();
          } else {
            reject(new Error("process finished with error code " + code));
          }
        });

        yarnAdd.on("error", (error) => {
          reject(error);
        });
      });
    },
  },
  makers: [
    {
      name: '@electron-forge/maker-squirrel',
      config: {},
    },
    {
      name: '@electron-forge/maker-zip',
      platforms: ['darwin'],
    },
    {
      name: '@electron-forge/maker-deb',
      config: {},
    },
    {
      name: '@electron-forge/maker-rpm',
      config: {},
    },
  ],
};
