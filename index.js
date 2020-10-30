const express = require("express");
const app = express();
const PORT = process.env.PORT || 4000;
const manga = require("./routers/manga");
const chapter = require("./routers/chapter");
const comment = require("./routers/comment");
const cors = require("cors");
const helmet = require("helmet");

app.use(cors());
app.use(helmet());
app.use("/api", manga);
app.use(express.static("./public"));
app.use("/api/chapter", chapter);
app.use("/api/comment", comment);
app.use("/api", (req, res) => {
  res.send({
    status: "Online",
    message: "Hanya untuk pribadi :)",
    find_me_on: {
      facebook: "https://www.facebook.com/teguhkurnia121",
    },
  });
});
app.use("*", (req, res) => {
  res.status(404).json({
    success: false,
    message: "api path not found",
  });
});

app.listen(PORT, () => {
  console.log("Listening on PORT:" + PORT);
});
