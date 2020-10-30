const router = require("express").Router();
const cheerio = require("cheerio");
const AxiosService = require("../helpers/axiosService");

router.get("/:threadId", async (req, res) => {
  try {
    //download
    let response = await AxiosService(
      `https://disqus.com/embed/comments/?base=default&f=komikcastnet&t_i=${req.params.threadId}%20https%3A%2F%2Fkomikcast.com%2F%3Fpost_type%3Dchapter%26%23038%3Bp%3D${req.params.threadId}`
    );
    const $ = cheerio.load(response.data);
    obj = $("#disqus-threadData").html();
    return res.json(JSON.parse(obj));
  } catch (error) {
    return res.json(error.message);
  }
});

module.exports = router;
