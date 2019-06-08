const express = require('express');
const fs = require('fs');
const Civ = require('./Civilopedia');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.statusCode = 200;
  res.send('Home page');
});

class Page {
  constructor(view, name, image, abbr) {
    this.view = view;
    this.name = name;
    this.image = image;
    this.abbr = abbr;
  }

  get link() {
    return `<a href="/civilopedia/${this.abbr}">${this.name}</a>`;
  }
}

const PAGES = {
  bldg: new Page('improvement', 'City Improvements', 'citywallsmea', 'bldg'),
  tech: new Page('advances', 'Civiliation Advances', 'literature', 'tech'),
  prto: new Page('unit', 'Units', 'rifleman', 'prto', 'prto'),
  good: new Page('resources', 'Resources', 'oil', 'good'),
  gvmt: new Page('government', 'Governments', 'democracy', 'gvmt'),
  terr: new Page('terrain', 'Terrain', 'mountains', 'terr'),
  tfrm: new Page('actions', 'Worker Actions', 'clearwetlands', 'tfrm'),
  race: new Page('concepts', 'Tribes', 'menu', 'race'),
  gcon: new Page('concepts', 'Game Concepts', 'concepts', 'gcon'),
  gwdr: new Page('improvement', 'Great Wonders', 'pyramid', 'gwdr'),
  swdr: new Page('improvement', 'Small Wonders', 'apollo', 'swdr'),
}

const CIVILOPEDIA_JSON = require('./public/civ3complete.json');

app.get('/civilopedia', function(req, res, next) {
  const keys = Object.keys(PAGES);

  res.status(200).render(PAGES.gcon.view, {
    text: '',
    header: 'Main Menu',
    image: 'menuredlarge',
    menu: keys.map(k => PAGES[k]),
  });
});

app.get('/civilopedia/:section', function(req, res, next) {
  const section = (req.params.section || '').toLowerCase();

  if (PAGES[section].name) {
    let keys = Object.keys(CIVILOPEDIA_JSON[section] || CIVILOPEDIA_JSON.bldg);
    if (section === 'bldg') {
      keys = keys.filter(k => CIVILOPEDIA_JSON.bldg[k].type === 'Improvement');
    } else if (section === 'gwdr') {
      keys = keys.filter(k => CIVILOPEDIA_JSON.bldg[k].type === 'Great Wonder');
    } else if (section === 'swdr') {
      keys = keys.filter(k => CIVILOPEDIA_JSON.bldg[k].type === 'Small Wonder');
    }


    const links = keys.map(k => {
      return `<a href="${Civ.fileNameToUrlPath(k)}">${(CIVILOPEDIA_JSON[section] || CIVILOPEDIA_JSON.bldg)[k].name}</a>`
    });

    res.status(200).render(PAGES.gcon.view, {
      header: PAGES[section].name,
      text: links.join('\n'),
      image: PAGES[section].image + 'large',
      menu: [],
    });
  } else {
    next();
  }
});

app.get('/civilopedia/:section/:page/:desc(desc)?', function(req, res, next) {
  const section = (req.params.section || '').toLowerCase();
  const page = (req.params.page || '').toLowerCase();
  const full = `${section}_${page}`;

  if (CIVILOPEDIA_JSON[section] && CIVILOPEDIA_JSON[section][full]) {
    const data = CIVILOPEDIA_JSON[section][full];

    res.status(200).render(PAGES[section].view, {
      text: Civ.parseText(data.text),
      header: data.name,
      image: `${page.toLowerCase().replace(/_/g, '')}large`,
      menu: [],
    });
  } else {
    next();
  }
});

app.use('*', function(req, res) {
  res.status(404).send('404 Not Found');
});

app.listen(4000, () => console.log('Running on port 4000'));
