const urls = require("../data/urls-data");
const uses = require("../data/uses-data")
function list(req, res) {
    res.json({data: urls});
}

let lastUrlId = urls.reduce((maxId, url) => Math.max(maxId, url.id), 0);
let lastUseId = uses.reduce((maxId, use) => Math.max(maxId, use.id), 0);

function bodyDataHas(propertyName) {
    return function (req, res, next) {
      const { data = {} } = req.body;
      if (data[propertyName]) {
        return next();
      }
      next({
          status: 400,
          message: `Must include a ${propertyName}`
      });
    };
  }

function create(req, res) {
  const { data: { href } = {} } = req.body;
  const newUrl = {
    id: ++lastUrlId, // Increment last id then assign as the current ID
    href: href,
  };
  urls.push(newUrl);
  res.status(201).json({ data: newUrl });
}

function urlExists(req, res, next) {
  const { urlId } = req.params;
  const foundUrl = urls.find(url => url.id === Number(urlId));
  if (foundUrl) {
    res.locals.url = foundUrl;
    return next();
  }
  next({
    status: 404,
    message: `Url id not found: ${urlId}`,
  });
};

function read(req, res, next) {
    uses.push({
        id: ++lastUseId,
        urlId: res.locals.url.id,
        time: Date.now(),
    })
  res.json({ data: res.locals.url });
};

function update(req, res) {
  const url = res.locals.url;
  const { data: { href } = {} } = req.body;

  // update the url
  url.href = href;

  res.json({ data: url });
}


module.exports = {
  create: [bodyDataHas("href"),create],  
  list,
  read: [urlExists, read],
  update: [urlExists, update],
  urlExists
};
