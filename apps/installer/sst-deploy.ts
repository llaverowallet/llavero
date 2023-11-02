//import { useSTSIdentity } from "sst/credentials.js";

//import { Stack } from "@serverless-stack/resources";
//import * as sst from "@serverless-stack/resources";
//import { llaveroStack, initLlavero } from "./sst.config";

// const app = new sst.App();

// const myStack = new MyStack(app, "my-stack");

// new Stack(app, "my-stack-stage", {
//     env: {
//         REGION: "us-east-1",
//         STAGE: "stage",
//     },
//     stackName: `${myStack.stackName}-stage`,
// });

// new Stack(app, "my-stack-prod", {
//     env: {
//         REGION: "us-east-1",
//         STAGE: "prod",
//     },
//     stackName: `${myStack.stackName}-prod`,

// });

//app.synth();

// const app = new App({ stage: "prod", region: "us-east-1", mode: "deploy" });
// app.stack(llaveroStack);
// app.stack(initLlavero);

// const assembly = app.synth();
// assembly.stacks.forEach((stack) => {
//     stack.de

async function deploy() {
    //"a9927"
    const { loadAssembly, useAppMetadata, saveAppMetadata, Stacks } = await import("sst/stacks/index.js");
    const { initProject, useProject } = await import("sst/project.js");
    await initProject({ stage: "prod", region: process.env.REGION, root: "../web/", profile: "web" });
    const project = useProject();
    // const [identity, appMetadata] = await Promise.all([
    //     useSTSIdentity(),
    //     useAppMetadata(),
    // ]);
    const isActiveStack = (stackId: string) => {
        if (stackId)
            return true;
        return false;
    }

    const createAssembly = async (configPath: string) => {
        // if (args.from) {
        //     const result = await loadAssembly(args.from);
        //     return result;
        // }
        const config = project.paths.config;
        const [_metafile, sstConfig] = await Stacks.load(
            config
        );
        const result = await Stacks.synth({
            fn: sstConfig.stacks,
            mode: "deploy",
            isActiveStack,
        });
        return result;
    };

    const assembly = await createAssembly("../web/sst.config.ts");
    const target = assembly.stacks.filter((s) => isActiveStack(s.id));
    if (!target.length) {
        throw new Error(`No stacks found matching`);
    }

    const results = await Stacks.deployMany(target);
    const failed = Object.values(results).find((result) =>
        Stacks.isFailed(result.status)
    );
    if (failed) {
        throw new Error(`CloudFormation status ${failed.errors}`);
    }
}

deploy();