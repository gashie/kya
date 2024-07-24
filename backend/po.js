const ReadText = require('text-from-image')
var ghCardUploadLink = "./ghCardUpload/";
ReadText(`${ghCardUploadLink}dd.jpg`).then(text => {
    console.log(text);
}).catch(err => {
    console.log(err);
})