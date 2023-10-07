export async function GET(request: Request) {
  console.info("Config: ", "hola");
  console.log("logging health"); 
   const envData = process.env.DATA_TEST;
  return Response.json({ status: "ok4", envData: envData })
}

