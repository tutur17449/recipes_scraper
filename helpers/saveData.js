const fs = require("fs");
const slugify = require("slugify");
const https = require("https");
const short = require("short-uuid");

// ****************************************************
// @desc    Download image
// ****************************************************
const download = (url, destination) =>
  new Promise((resolve, reject) => {
    const file = fs.createWriteStream(destination);

    https
      .get(url, (response) => {
        response.pipe(file);
        file.on("finish", () => {
          console.log("Success : image download");
          file.close(resolve(true));
        });
      })
      .on("error", (error) => {
        console.log(error);
        console.log("Failure : image download");
        fs.unlink(destination);
        reject(error.message);
      });
  });

// ****************************************************
// @desc    Save data into json file
// ****************************************************
const toJson = (data, key, src) =>
  new Promise((resolve, reject) => {
    const tmp = JSON.stringify({
      ...data,
      image: `./seed/recettesImages/${key}.jpg`,
    });
    fs.writeFile(`./data/${src}/${key}.json`, tmp, (err, data) => {
      if (err) {
        console.log("Failure : data save into json");
        reject(err);
      } else {
        console.log("Success : data save into json");
        resolve(data);
      }
    });
  });

// ****************************************************
// @desc    SAVE DATA
// ****************************************************
exports.save = (data, src) =>
  new Promise(async (resolve, reject) => {
    if (data.name) {
      var key = slugify(data.name, {
        remove: /[*+~.,()'"!:@]/g,
        replacement: "_",
        lower: true,
      });
    }
    try {
      const image = await download(data.img, `./data/${src}/${key}.jpg`);
      delete data.img;
      const saveToJson = await toJson(data, key, src);
      resolve(data);
    } catch (err) {
      reject(err);
    }
  });
