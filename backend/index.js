const express = require("express");
const config = require("config")
const { rootRouter } = require("./routes");
const cors = require("cors")

const app = express()
const port = 3000

if (!config.get('jwtPrivateKey')) {
    console.log('Fatal Error. jwtPrivateKey is not defined')
    process.exit(1);
}

app.use(cors())
app.use(express.json())
app.use("/api/v1", rootRouter)

app.listen(`Listening on port ${port}`, port)


