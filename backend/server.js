var apm = require('elastic-apm-node').start({

  // Override the service name from package.json
  // Allowed characters: a-z, A-Z, 0-9, -, _, and space
  serviceName: 'Gh-Card-KYC-API',
  
  // Use if APM Server requires a secret token
 
  
  // // Set the custom APM Server URL (default: http://localhost:8200)
  // serverUrl: 'http://10.10.30.120:8200',

   // Use if APM Server requires a secret token
secretToken: 'Mhqvjvd6oP7pFTT4lp',

// Set the custom APM Server URL (default: http://localhost:8200)
serverUrl: 'https://384ded15058347c9b004fc7fa2d71164.apm.westus2.azure.elastic-cloud.com:443',
  
  // Set the service environment
  environment: 'production',
  instrument:true,
  instrumentIncomingHTTPRequests:true,
  captureBody:true,
  captureHeaders:true,
  errorOnAbortedRequests:true,
  frameworkName:"Express",
  captureExceptions:true,
  logUncaughtExceptionsedit:true,
  usePathAsTransactionName:true
  })
const express = require('express');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser');
const path = require("path")
const morgan = require('morgan');
const useragent = require('express-useragent');
const errorHandler = require("./middleware/error");
const fileupload = require("express-fileupload");
const helmet = require("helmet");
const xss = require("xss-clean");

//call routes files


const apps = require('./routes/apps/setup');

//load env vars
dotenv.config({ path: './config/config.env' });
//initialise express
const app = express();
app.use(useragent.express());
//body parser

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(fileupload({
  limits: {
      fileSize: 10000000 //1mb
  },
  abortOnLimit: true,
  responseOnLimit:'File size limit has been reached'
}));
app.use(cookieParser());
app.use(helmet({crossOriginResourcePolicy: false}));
app.use(express.static(path.join(__dirname,'build')))
//Set Security Headers

//Prevent XSS Attack
app.use(xss())

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
//Mount routes

app.use(function (req, res, next) {
  res.removeHeader("x-powered-by");
  res.removeHeader("set-cookie");
  res.removeHeader("Date");
  res.removeHeader("Connection");
  
  next();
});
app.use(function (req, res, next) {
  /* Clickjacking prevention */
  res.header('Content-Security-Policy', "frame-ancestors directive")
  next()
})
 app.use('/api/v1/customer/', apps);

//  app.use((req, res, next) => {
//   var ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress
//   var destination = req.originalUrl
//   console.log(`Showing ip`,ip,`and destination is`,destination);
//   if (ip.startsWith("192.168") && req.path.startsWith("/ghCardUpload/")) {
//     console.log(`You cant access`,ip,`this destination`,destination);
//     return next();
//   }

//   if (ip.startsWith("10.130") && req.path.startsWith("/ghCardSelfie/")) {
//     console.log(`You cant access`,ip,`this destination`,destination);
//     return next();
//  }

//  return ;
 
// });
 var __dirname = path.resolve()
 app.use('/ghCardUpload', express.static(path.join(__dirname, '/ghCardUpload')))
 app.use('/ghCardSelfie', express.static(path.join(__dirname, '/ghCardSelfie')))
 app.get('/*',function(req,res){
   res.sendFile(path.join(__dirname,'build','index.html'))
 })
app.use(errorHandler);
//errror middleware
app.use((req, res, next) => {
  const error = new Error('Not found');
  error.status = 404;
  next(error);
});

app.use((error, req, res, next) => {
  res.status(error.status || 500);
  res.json({
    error: {
      message: error.message,
    },
  });
});
//create port
const PORT = process.env.PORT || 5000;
//listen to portnpm
app.listen(PORT, () => {
  console.log(
    `App running in ${process.env.NODE_ENV} mode and listening on port http://localhost:${PORT}`
  );
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log(`Error: ${err.message}`);
  // Close server & exit process
  // server.close(() => process.exit(1));
});
