const cheerio = require("cheerio");
const axios = require("axios");
const urlListPickFreshFoods = require("./urlListPickFreshFoods.json");
const { save } = require("./helpers/saveData");
const { getTraduction } = require("./helpers/translateContent");
const delay = (time) => new Promise((res) => setTimeout(res, time));

// ****************************************************
// @desc    Parse url data, format and translate
// ****************************************************
const crawlUrl = async (data) => {
  // Parse data
  const $ = cheerio.load(data);
  const div = $("#genesis-content");
  var recipe = {};
  recipe.tags = $('meta[name="keywords"]').attr("content").split(",");
  recipe.description = $('meta[name="description"]').attr("content");
  div.each((i, elt) => {
    recipe.img = $(".entry-content a:first", elt).first().attr("href");
    recipe.nbPers = $('span[itemprop="recipeYield"]', elt).text();
    recipe.preparation = $(".ERSInstructions ol li", elt)
      .map((i, id) => {
        return $(id).text();
      })
      .toArray();
    recipe.ingredients = $(".ERSIngredients ul li", elt)
      .map((i, id) => {
        return $(id).text();
      })
      .toArray();
    recipe.tempsCuisson = $('time[itemprop="cookTime"]', elt).text();
    recipe.tempsPreparation = $('time[itemprop="prepTime"]', elt).text();
  });

  console.log("Success : parse data");

  // Translate data
  const descriptionTard = await getTraduction(recipe.description);
  recipe.description = descriptionTard;

  console.log("Success : description translate");

  await delay(500);

  let tmpPreparation = [];
  const preparationTrad = await Promise.all(
    recipe.preparation.map((i, id) => {
      return getTraduction(i);
    })
  );
  preparationTrad.map((i, id) => {
    tmpPreparation = [
      ...tmpPreparation,
      {
        step: i,
      },
    ];
  });
  recipe.preparation = tmpPreparation;

  console.log("Success : preparation translate");

  await delay(500);

  let tmpIngredients = [];
  const ingredientsTrad = await Promise.all(
    recipe.ingredients.map((i, id) => {
      return getTraduction(i);
    })
  );
  ingredientsTrad.map((i, id) => {
    tmpIngredients = [
      ...tmpIngredients,
      {
        value: i,
        qty: "",
      },
    ];
  });

  recipe.ingredients = tmpIngredients;

  console.log("Success : ingredients translate");

  await delay(500);

  const tagsTrad = await Promise.all(
    recipe.tags.map((i, id) => {
      if (i !== "") {
        return getTraduction(i);
      }
    })
  );
  recipe.tags = tagsTrad;

  console.log("Success : tags translate");

  return recipe;
};

// ****************************************************
// @desc    Request url and start process for this
// ****************************************************
const getUrl = async (url, type, name) => {
  try {
    const htmlData = await axios.get(url);
    console.log("Succes : get data from request");
    const crawlData = await crawlUrl(htmlData.data);
    crawlData.name = name;
    crawlData.categorie = type;
    crawlData.sourceAuthor = "Pick Fresh Foods";
    crawlData.sourceName = "Pick Fresh Foods";
    crawlData.license = "CC BY 3.0";
    crawlData.sourceUrl = "https://pickfreshfoods.com/";
    crawlData.difficulte = "";
    const finalData = await save(crawlData, "pickfreshfoods");
    return crawlData;
  } catch (err) {
    throw err;
  }
};

// ****************************************************
// @desc    Start scrap on the url list
// ****************************************************
const scrapList = async () => {
  const l = urlListPickFreshFoods.length;
  for (let i = 0; i < l; i++) {
    try {
      const data = await getUrl(
        urlListPickFreshFoods[i].url,
        urlListPickFreshFoods[i].type,
        urlListPickFreshFoods[i].name
      );
      console.log(`Success : ${urlListPickFreshFoods[i].name}`);
    } catch (err) {
      console.log(err);
      console.log(`Failure : ${urlListPickFreshFoods[i].name}`);
    }
  }
};

scrapList();
