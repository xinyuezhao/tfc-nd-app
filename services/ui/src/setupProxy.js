const { createProxyMiddleware } = require('http-proxy-middleware');

var cookie;

module.exports = function(app) {
  app.use(
    ['/login', '/appcenter/cisco/terraform/api', '/sedgeapi'],
    createProxyMiddleware({
      target: 'https://172.31.187.83',
      changeOrigin: true,
      secure: false,
      cookieDomainRewrite: 'localhost',
      onProxyReq: relayRequestHeaders,
      onProxyRes: relayResponseHeaders,
    })
  );
};

function relayRequestHeaders(proxyReq, req) {
  if (cookie) {
    proxyReq.setHeader('cookie', cookie);
  }
};

function relayResponseHeaders(proxyRes, req, res) {
  var proxyCookie = proxyRes.headers["set-cookie"];
  if (proxyCookie) {
    cookie = proxyCookie;
  }
};