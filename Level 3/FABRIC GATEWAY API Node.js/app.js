var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
var swaggerJsdoc = require("swagger-jsdoc");
var swaggerUi = require("swagger-ui-express");
var assetRouter = require("./routes/assets");
var app = express();
var options = {
  swaggerDefinition: {
    info: {
      title: "My API",
      version: "1.0.0",
      description: "FABRIC GATEWAY API",
    },
  },
  apis: [path.join(__dirname, "/routes/*.js")],
};
var swaggerSpecs = swaggerJsdoc(options);
app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));
app.use("/swagger", swaggerUi.serve, swaggerUi.setup(swaggerSpecs));
app.use("/", indexRouter);
app.use("/users", usersRouter);

module.exports = app;
