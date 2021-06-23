const cheerio = require("cheerio");
const axios = require("axios");
const urlListCuisineSaine = require("./urlListCuisineSaine.json");
const { save } = require("./helpers/saveData");
const { getTraduction } = require("./helpers/translateContent");
const delay = (time) => new Promise((res) => setTimeout(res, time));

// ****************************************************
// @desc    Parse url data, format and translate
// ****************************************************
const crawlUrl = async (data) => {
  // Parse data
  const $ = cheerio.load(data);
  const div = $("#main-content");
  var recipe = {};
  div.each((i, elt) => {
    recipe.img =
      $(".wp-caption img", elt).attr("data-src") ||
      $(".visuel img", elt).attr("data-src");
    recipe.nbPers = $(".yield", elt).text();
    recipe.preparation = $("ol.recette li", elt)
      .map((i, id) => {
        return {
          step: $(id).text(),
        };
      })
      .toArray();
    recipe.ingredients = $("div.ingredient ul li", elt)
      .map((i, id) => {
        return {
          value: $("span", id).text() || $(id).text(),
          qty: $(".amount", id).text() || "à sa guise",
        };
      })
      .toArray();
    recipe.description = $('p[itemprop="description"]', elt).text();
    recipe.tags = $(".keywords a", elt)
      .map((i, id) => {
        return $(id).text();
      })
      .toArray();
    recipe.tempsCuisson =
      $('time[itemprop="cookTime"]', elt).text() ||
      $(".cooktime", elt).text() ||
      0;
    recipe.tempsPreparation =
      $('time[itemprop="prepTime"]', elt).text() ||
      $(".preptime", elt).text() ||
      0;
    recipe.sourceAuthor = $(".author a", elt).text();
  });
  console.log("Success : parse data");

  return recipe;
};

// ****************************************************
// @desc    Request url and start process for this
// ****************************************************
const getUrl = async (url, type, name, difficulte, keywords) => {
  try {
    const htmlData = await axios.get(url);
    console.log("Succes : get data from request");
    const crawlData = await crawlUrl(htmlData.data);
    crawlData.name = name;
    crawlData.categorie = type;
    crawlData.sourceName = "Cuisine Saine";
    crawlData.license = "CC BY-NC 4.0";
    crawlData.sourceUrl = "https://cuisine-saine.fr/";
    crawlData.difficulte = difficulte;
    crawlData.tags = [...crawlData.tags, ...keywords];
    const finalData = await save(crawlData, "cuisinesaine");
    return crawlData;
  } catch (err) {
    throw err;
  }
};

// ****************************************************
// @desc    Start scrap on the url list
// ****************************************************
const scrapList = async () => {
  const l = urlListCuisineSaine.length;
  for (let i = 0; i < l; i++) {
    try {
      const data = await getUrl(
        urlListCuisineSaine[i].url,
        urlListCuisineSaine[i].type,
        urlListCuisineSaine[i].name,
        urlListCuisineSaine[i].difficulte,
        urlListCuisineSaine[i].keywords
      );
      console.log(`Success : ${urlListCuisineSaine[i].name}`);
    } catch (err) {
      console.log(err);
      console.log(`Failure : ${urlListCuisineSaine[i].name}`);
    }
  }
};

scrapList();
