const tesseract = require("node-tesseract-ocr")
var ghCardUploadLink = "./ghCardUpload/";
const config = {
  lang: "eng",
  oem: 1,
  psm: 3,
}

tesseract
  .recognize(`${ghCardUploadLink}nrr.jpg`, config)
  .then((text) => {
    let newtext = text.replace(/(\r\n|\n|\r)/gm, "").split(',')[2]
   console.log(text);
  })
  .catch((error) => {
    console.log(error.message)
  })