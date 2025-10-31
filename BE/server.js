const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const routes = require("./route");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const dotenv = require("dotenv");
dotenv.config();
const configs = process.env;

const app = express();
const port = 3000;
app.use(
  cors({
    origin: "*",
  })
);
app.use(fileUpload());
app.use(bodyParser.json());
app.use(express.static("./public"));
app.use("/api/", routes);

mongoose
  .connect(configs.MONGOURL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("Could not connect to MongoDB", err));

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
