import { SSTConfig } from "sst";

export default {
  config(_input) {
    return {
      name: "sst-basic",
      region: "us-east-1",
    };
  },
  stacks(app) {
    app.stack(function Llavero({ stack }) {
      
      console.log("stack", stack);
     
    });
  },
} satisfies SSTConfig;
