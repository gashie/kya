const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function(app) {
    app.use(
      createProxyMiddleware(["/api/v1/", , "/otherApi"], { target: "http://localhost:3116" })
    );
  };