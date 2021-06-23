const cheerio = require("cheerio");
const axios = require("axios");
const urlListFoodista = require("./urlListFoodista.json");
const { save } = require("./helpers/saveData");
const { getTraduction } = require("./helpers/translateContent");
const delay = (time) => new Promise((res) => setTimeout(res, time));

// ****************************************************
// @desc    Parse url data, format and translate
// ****************************************************
const crawlUrl = async (data) => {
  // Parse data
  const $ = cheerio.load(data);
  const div = $("#content");
  var recipe = {};
  div.each((i, elt) => {
    recipe.img = $(".field-name-field-image a", elt).attr("href");
    recipe.nbPers = $('div[itemprop="recipeYield"]', elt).text();
    recipe.preparation = $(".field-name-field-rec-steps .field-item", elt)
      .map((i, id) => {
        return $(id).text();
      })
      .toArray();
    recipe.ingredients = $('div[itemprop="ingredients"]', elt)
      .map((i, id) => {
        return $(id).text();
      })
      .toArray();
    recipe.description = $(".field-name-body", elt).text().toString();
    recipe.tags = $(".field-name-field-tags .field-item", elt)
      .map((i, id) => {
        return $(id).text();
      })
      .toArray();
    recipe.sourceAuthor = $("a.username", elt).text();
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
      return getTraduction(i);
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
    crawlData.sourceName = "Foodista";
    crawlData.license = "CC BY 3.0";
    crawlData.sourceUrl = "https://www.foodista.com/";
    crawlData.tempsCuisson = "";
    crawlData.tempsPreparation = "";
    crawlData.difficulte = "";
    const finalData = await save(crawlData, "foodista");
    return crawlData;
  } catch (err) {
    throw err;
  }
};

// ****************************************************
// @desc    Start scrap on the url list
// ****************************************************
const scrapList = async () => {
  const l = urlListFoodista.length;
  for (let i = 0; i < l; i++) {
    try {
      const data = await getUrl(
        urlListFoodista[i].url,
        urlListFoodista[i].type,
        urlListFoodista[i].name
      );
      console.log(`Success : ${urlListFoodista[i].name}`);
    } catch (err) {
      console.log(err);
      console.log(`Failure : ${urlListFoodista[i].name}`);
    }
  }
};

scrapList();
