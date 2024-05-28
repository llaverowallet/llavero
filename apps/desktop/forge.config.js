const path = require('path');
const fs = require('fs');
const { execSync } = require('child_process');

module.exports = {
  hooks: {
    packageAfterPrune: async (
      config,
      buildPath,
      electronVersion,
      platform,
      arch,
    ) => {
      console.log('Executing packageAfterPrune hook...'); // Log statement to confirm hook execution

      const commands = [
        'add',
        'serialport',
        '@aws-cdk/cloudformation-diff', // Add @aws-cdk/cloudformation-diff module
        '@aws-cdk/cfnspec', // Add @aws-cdk/cfnspec module
      ];

      try {
        // Log the contents of node_modules before adding the modules
        const filesBefore = fs.readdirSync(
          path.join(buildPath, 'node_modules'),
        );
        console.log(
          'Contents of node_modules before adding modules:',
          filesBefore,
        );

        // Ensure package.json is present throughout the build process
        const yarnAddCommand = `yarn ${commands.join(' ')}`;
        console.log(`Executing command: ${yarnAddCommand}`);
        execSync(yarnAddCommand, {
          cwd: buildPath,
          stdio: 'inherit',
          shell: true,
        });
        console.log(
          'yarn add serialport, @aws-cdk/cloudformation-diff, and @aws-cdk/cfnspec command executed successfully',
        );

        if (platform === 'win32') {
          const problematicPaths = [
            'android-arm',
            'android-arm64',
            'darwin-x64+arm64',
            'linux-arm',
            'linux-arm64',
            'linux-x64',
          ];

          problematicPaths.forEach((binaryFolder) => {
            fs.rmSync(
              path.join(
                buildPath,
                'node_modules',
                '@serialport',
                'bindings-cpp',
                'prebuilds',
                binaryFolder,
              ),
              { recursive: true, force: true },
            );
          });
        }

        // Log the contents of node_modules to verify presence of all expected modules
        const filesAfter = fs.readdirSync(path.join(buildPath, 'node_modules'));
        console.log(
          'Contents of node_modules after adding modules:',
          filesAfter,
        );
        // Check if "@aws-cdk/cloudformation-diff" is present
        if (filesAfter.includes('@aws-cdk')) {
          const awsCdkFiles = fs.readdirSync(
            path.join(buildPath, 'node_modules', '@aws-cdk'),
          );
          console.log('Contents of @aws-cdk:', awsCdkFiles);
          // Check if "cloudformation-diff" is present
          if (awsCdkFiles.includes('cloudformation-diff')) {
            console.log('@aws-cdk/cloudformation-diff module is present');
          } else {
            console.error('@aws-cdk/cloudformation-diff module is missing');
          }
          // Check if "cfnspec" is present
          if (awsCdkFiles.includes('cfnspec')) {
            console.log('@aws-cdk/cfnspec module is present');
          } else {
            console.error('@aws-cdk/cfnspec module is missing');
          }
        } else {
          console.error('@aws-cdk directory is missing');
        }
      } catch (error) {
        console.error('Error executing yarn add command:', error);
        throw error;
      }
    },
  },
  packagerConfig: {
    ignore: (file) => {
      // Log the files being processed by the ignore function
      console.log('Processing file in ignore function:', file);

      // Ensure that the package.json file and @aws-cdk modules are not ignored
      if (
        file.includes('package.json') ||
        file.includes('@aws-cdk/cloudformation-diff') ||
        file.includes('@aws-cdk/cfnspec')
      ) {
        console.log('Not ignoring file:', file);
        return false;
      }
      // Do not ignore any other files
      return false;
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
