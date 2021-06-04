const express = require("express");
const cors = require("cors");
const app = express();

const port = process.env.PORT;
const {scrapeFromURL, firstMessage} = require("./src/middleware/scrape");
const router = require("./src/routers/route");


app.use(cors());
app.use(express.json());
app.use(router);


app.listen(port, ()=>{
    console.log("Server connected, port: ", port);
    // firstMessage()
})