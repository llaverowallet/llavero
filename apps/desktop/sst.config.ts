// import { SSTConfig } from "sst";
// import { llaveroStack, initLlavero } from "../web/sst.config";
// export default {
//   config(_input) {
//     return {
//       name: "sst-basic",
//       region: "us-east-1",
//     };
//   },
//   stacks(app) {
//     app.stack(function Llavero({ stack }) {
//       process.env.BasePath = process.cwd().replace("desktop", "web") + "/"; //TODO: this is a hack on another OS might nowt work the slash
//       console.log("process.env.BasePath", process.env.BasePath);
//       app.stack(llaveroStack);
//       app.stack(initLlavero)
     
//     });
//   },
// } satisfies SSTConfig;
