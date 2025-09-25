const http=require("http");
http.createServer((req,res)=>res.end("ok"))
  .listen(4300,"127.0.0.1",()=>console.log("listening on 127.0.0.1:4300"));

