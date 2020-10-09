const router = require("express").Router();
const cheerio = require("cheerio");
const baseUrl = require("../constants/urls");
const replaceMangaPage = "https://komikcast.com/komik/";
const AxiosService = require("../helpers/axiosService");
const getCss = require("get-css");

// manga popular
router.get("/daftar-komik/popular", async (req, res) => {
  let url = `daftar-komik/page/1/?order=popular`;

  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".mrgn");
      let manga_list = [];
      let title, type, rating, endpoint, thumb, chapter, status;

      element.find(".listupd .bs").each((idx, el) => {
        if (idx < 15) {
          title = $(el).find(".bsx > .bigor > a > .tt").text().trim();
          endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
          type = $(el).find(".bsx > a > .limit > .type").text();
          thumb = $(el).find(".bsx > a > .limit > img").attr("src");
          chapter = $(el).find(".bsx > .bigor > .adds > .epxs > a").text();
          rating = $(el)
            .find(".bsx > .bigor > .adds > .rating > i")
            .text()
            .replace(",", ".");
          status = $(el).find(".bsx > a > .limit > .status").text();
          manga_list.push({
            title,
            thumb,
            type,
            rating,
            endpoint,
            chapter,
            status,
          });
        }
      });
      return res.status(200).json({
        status: true,
        message: "success",
        manga_list,
      });
    }
    return res.send({
      message: response.status,
      manga_list: [],
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});

// detail manga  ---- Done -----
router.get("/komik/:slug", async (req, res) => {
  const slug = req.params.slug;
  const response = await AxiosService("komik/" + slug);
  const $ = cheerio.load(response.data);
  const element = $(".komikinfo article");
  let genre_list = [];
  let chapter = [];
  const obj = {};

  /* Get Title, Subtitle, Type, Author, Status */
  obj.title = element
    .find(".bixbox > .bigcontent > .infox > h1")
    .text()
    .replace(" Bahasa Indonesia", "");
  obj.sub_title = element.find(".bixbox > .bigcontent > .infox > span").text();
  obj.type = element
    .find(".bixbox > .bigcontent > .infox > .spe > span:nth-child(5)")
    .text()
    .replace("Type: ", "");
  obj.status = element
    .find(".bixbox > .bigcontent > .infox > .spe > span:nth-child(2)")
    .text()
    .replace("Status: ", "");
  obj.released_on = element
    .find(".bixbox > .bigcontent > .infox > .spe > span:nth-child(3)")
    .text()
    .replace("Released: ", "");
  obj.author = element
    .find(".bixbox > .bigcontent > .infox > .spe > span:nth-child(4)")
    .text()
    .replace("Author: ", "");
  obj.total_chpater = element
    .find(".bixbox > .bigcontent > .infox > .spe > span:nth-child(6)")
    .text()
    .replace("Total Chapter: ", "");
  obj.updated_on = element
    .find(".bixbox > .bigcontent > .infox > .spe > span:nth-child(7) > time")
    .text();
  obj.rating = element
    .find(".bixbox > .bigcontent > .rt > .rating > strong")
    .text()
    .replace("Rating ", "")
    .replace(",", ".");

  /* Set Manga Endpoint */
  obj.manga_endpoint = slug;

  /* Get Manga Thumbnail */
  obj.thumb = element
    .find("article > .bixbox > .bigcover > .ime > img")
    .attr("src");

  element
    .find(".bixbox > .bigcontent > .infox > .spe > span:nth-child(1) a")
    .each((idx, el) => {
      let genre_name = $(el).text();
      genre_list.push({
        genre_name,
      });
      obj.genre_list = genre_list;
    });

  /* Get Synopsis */
  obj.sinopsis = element
    .find(".bixbox > .desc > div > p")
    .text()
    .replace("Komikcast", "GKomik");

  /* Get Chapter List */
  element.find(".bixbox > .cl > ul > li").each((index, el) => {
    let chapter_title = $(el).find(".leftoff").text();
    let chapter_endpoint = $(el).find("a").attr("href").replace(baseUrl, "");
    let released_on = $(el).find(".rightoff").text();

    chapter.push({
      chapter_title,
      released_on,
      // chapter_pages,
      chapter_endpoint,
    });
    obj.chapter = chapter;
  });

  res.status(200).json(obj);
});

//mangalist pagination  -------Done------
router.get("/daftar-komik/page/:pagenumber", async (req, res) => {
  let pagenumber = req.params.pagenumber;
  let url = `daftar-komik/page/${pagenumber}/?order=latest`;

  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".mrgn");
      let manga_list = [];
      let title, type, rating, endpoint, thumb, chapter, status;
      let total_page;

      element.find(".listupd .bs").each((idx, el) => {
        title = $(el).find(".bsx > .bigor > a > .tt").text().trim();
        endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(el).find(".bsx > a > .limit > .type").text();
        thumb = $(el).find(".bsx > a > .limit > img").attr("src");
        chapter = $(el).find(".bsx > .bigor > .adds > .epxs > a").text();
        rating = $(el)
          .find(".bsx > .bigor > .adds > .rating > i")
          .text()
          .replace(",", ".");
        status = $(el).find(".bsx > a > .limit > .status").text();
        manga_list.push({
          title,
          thumb,
          type,
          rating,
          endpoint,
          chapter,
          status,
        });
      });
      total_page =
        element.find(".pagination .page-numbers:nth-last-child(2)").text() <
        pagenumber
          ? pagenumber
          : element.find(".pagination .page-numbers:nth-last-child(2)").text();
      return res.status(200).json({
        status: true,
        message: "success",
        total_page,
        current_page: pagenumber,
        manga_list,
      });
    }
    return res.send({
      message: response.status,
      manga_list: [],
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});

//serach manga ------Done-----------
router.get("/cari/:query/:pagenumber?", async (req, res) => {
  const query = req.params.query;
  const pagenumber = req.params.pagenumber ? req.params.pagenumber : 1;
  const url = `?s=${query}`;

  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".bixbox");
      let manga_list = [];
      let title, type, rating, endpoint, thumb, chapter, status;
      let total_page;

      element.find(".listupd .bs").each((idx, el) => {
        title = $(el).find(".bsx > .bigor > a > .tt").text().trim();
        console.log(title);
        endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(el).find(".bsx > a > .limit > .type").text();
        thumb = $(el).find(".bsx > a > .limit > img").attr("src");
        chapter = $(el).find(".bsx > .bigor > .adds > .epxs > a").text();
        rating = $(el)
          .find(".bsx > .bigor > .adds > .rating > i")
          .text()
          .replace(",", ".");
        status = $(el).find(".bsx > a > .limit > .status").text();
        manga_list.push({
          title,
          thumb,
          type,
          rating,
          endpoint,
          chapter,
          status,
        });
      });
      return res.status(200).json({
        status: true,
        message: "success",
        current_page: pagenumber,
        manga_list,
      });
    }
    return res.send({
      message: response.status,
      manga_list: [],
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});

//genreList  -----Done-----
router.get("/genres", async (req, res) => {
  const url = "genres/police";

  try {
    const response = await AxiosService(url);

    const $ = cheerio.load(response.data);
    const element = $(".listupd");
    var list_genre = [];
    var title, endpoint;
    element.find(".genresx > li").each((idx, el) => {
      genre_name = $(el).text();
      if (!genre_name.includes("(0)")) {
        genre_name = genre_name.split(" (")[0];
        list_genre.push({
          genre_name,
        });
      }
    });
    list_genre = list_genre.splice(0, 59);
    res.json({
      status: 200,
      message: "success",
      list_genre,
    });
  } catch (error) {
    res.send({
      message: error,
    });
  }
});

//genreDetail ----Done-----
router.get("/genres/:slug/:pagenumber", async (req, res) => {
  const slug = req.params.slug;
  const pagenumber = req.params.pagenumber;
  const url = `daftar-komik/page/${pagenumber}/?order=latest&genre=${slug}`;
  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".bixbox > .mrgn");
      let manga_list = [];
      let title, type, rating, endpoint, thumb, chapter, status;

      element.find(".listupd .bs").each((idx, el) => {
        title = $(el).find(".bsx > .bigor > a > .tt").text().trim();
        console.log(title);
        endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(el).find(".bsx > a > .limit > .type").text();
        thumb = $(el).find(".bsx > a > .limit > img").attr("src");
        chapter = $(el).find(".bsx > .bigor > .adds > .epxs > a").text();
        rating = $(el)
          .find(".bsx > .bigor > .adds > .rating > i")
          .text()
          .replace(",", ".");
        status = $(el).find(".bsx > a > .limit > .status").text();
        console.log(title);
        manga_list.push({
          title,
          thumb,
          type,
          rating,
          endpoint,
          chapter,
          status,
        });
      });
      return res.status(200).json({
        status: true,
        message: "success",
        current_page: pagenumber,
        manga_list,
      });
    }
    return res.send({
      message: response.status,
      manga_list: [],
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});

//manhua  ------Done------
router.get("/type/:slug/:pagenumber", async (req, res) => {
  let pagenumber = req.params.pagenumber;
  let slug = req.params.slug;
  let url = `type/${slug}/page/${pagenumber}`;

  try {
    const response = await AxiosService(url);
    if (response.status === 200) {
      const $ = cheerio.load(response.data);
      const element = $(".listupd");
      let manga_list = [];
      let title, type, rating, endpoint, thumb, chapter, status;
      let total_page;

      element.find(".listo .bs").each((idx, el) => {
        title = $(el).find(".bsx > .bigor > a > .tt").text().trim();
        endpoint = $(el).find("a").attr("href").replace(replaceMangaPage, "");
        type = $(el).find(".bsx > a > .limit > .type").text();
        thumb = $(el).find(".bsx > a > .limit > img").attr("src");
        chapter = $(el).find(".bsx > .bigor > .adds > .epxs > a").text();
        rating = $(el)
          .find(".bsx > .bigor > .adds > .rating > i")
          .text()
          .replace(",", ".");
        status = $(el).find(".bsx > a > .limit > .status").text();
        manga_list.push({
          title,
          thumb,
          type,
          rating,
          endpoint,
          chapter,
          status,
        });
      });
      return res.status(200).json({
        status: true,
        message: "success",
        current_page: pagenumber,
        manga_list,
      });
    }
    return res.send({
      message: response.status,
      manga_list: [],
    });
  } catch (err) {
    res.send({
      status: false,
      message: err,
      manga_list: [],
    });
  }
});

module.exports = router;
