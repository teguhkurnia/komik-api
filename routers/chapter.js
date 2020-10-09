const router = require("express").Router();
const cheerio = require("cheerio");
const AxiosService = require("../helpers/axiosService");

router.get("/", (req, res) => {
  res.send({
    message: "chapter",
  });
});

//chapter ----done ----
router.get("/:slug", async (req, res) => {
  const slug = req.params.slug;
  let link;
  try {
    //download
    let pdfResponse = await AxiosService(`https://pdf.komiku.co.id/${slug}`);
    const pdf$ = cheerio.load(pdfResponse.data);
    const element = pdf$(".title");
    link = element
      .find("a")
      .attr("href")
      .split("  ")
      .join("%20%20")
      .split(" ")
      .join("%20");
  } catch (error) {
    link = "no download link";
  }
  try {
    //response
    const response = await AxiosService(slug);
    const $ = cheerio.load(response.data);
    const content = $(".postarea > article");
    let chapter_image = [];
    const obj = {};
    obj.chapter_endpoint = slug + "/";

    const getTitlePages = content.find(".headpost");
    getTitlePages.filter(() => {
      obj.title = $(getTitlePages)
        .find("h1")
        .text()
        .replace("Bahasa Indonesia", "");
    });
    obj.download_link = link;

    const getPages = content.find("#readerarea").find("img");
    let e = 1;
    getPages.each((i, el) => {
      let chapter_image_link;
      if ($(el).attr("src")) {
        chapter_image_link = $(el).attr("src");
        chapter_image.push({
          chapter_image_link,
          image_number: e++,
        });
      }
    });
    obj.chapter_image = chapter_image;
    obj.chapter_pages = chapter_image.length;
    res.json(obj);
  } catch (error) {
    console.log(error);
    res.send({
      message: error,
    });
  }
});

module.exports = router;
