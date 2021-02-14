require("dotenv").config();
const express = require("express");
const morgan = require("morgan");
const cors = require("cors");
const helmet = require("helmet");
const { NODE_ENV } = require("./config");
const logger = require("./logger");
const app = express();

const { UserRouter } = require("./user/user-routes");
const { authenticateToken } = require("./auth");
const { ProjectRouter } = require("./project/project-routes");
const { SceneRouter } = require("./scene/scene-routes");

const morganOption = NODE_ENV === "production" ? "tiny" : "dev";
app.use(express.json());
app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());

app.get("/", (req, res) => {
  res.send("Hello, world!");
});

app.use("/api/user", UserRouter);
app.use(authenticateToken);
app.use("/api/project", ProjectRouter);
app.use("/api/scene", SceneRouter);


app.use((error, req, res, next) => {
  let response;
  if (NODE_ENV === "production") {
    response = { error: { message: "server error" } };
  } else {
    console.log(error);
    response = { message: error.message, error };
  }
  res.status(500).json(response);
});

module.exports = app;
