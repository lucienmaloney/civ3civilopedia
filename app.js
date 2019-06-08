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

  get path() {
    return `/civilopedia/${this.abbr}`;
  }
}

const PAGES = {
  race: new Page('concepts', 'Tribes', 'menu', 'race'),
  tech: new Page('advances', 'Civiliation Advances', 'literature', 'tech'),
  gwdr: new Page('improvement', 'Great Wonders', 'pyramid', 'gwdr'),
  swdr: new Page('improvement', 'Small Wonders', 'apollo', 'swdr'),
  bldg: new Page('improvement', 'City Improvements', 'citywallsmea', 'bldg'),
  gvmt: new Page('government', 'Governments', 'democracy', 'gvmt'),
  prto: new Page('unit', 'Units', 'rifleman', 'prto', 'prto'),
  tfrm: new Page('actions', 'Worker Actions', 'clearwetlands', 'tfrm'),
  terr: new Page('terrain', 'Terrain', 'mountains', 'terr'),
  good: new Page('resources', 'Resources', 'oil', 'good'),
  gcon: new Page('concepts', 'Game Concepts', 'concepts', 'gcon'),
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


    const menu = keys.map(k => {
      const name = (CIVILOPEDIA_JSON[section] || CIVILOPEDIA_JSON.bldg)[k].name;
      return {
        name: name,
        image: name.toLowerCase().replace(/_/g, ''),
        path: Civ.fileNameToUrlPath(k),
      };
    });

    res.status(200).render(PAGES.gcon.view, {
      header: PAGES[section].name,
      text: '',
      image: PAGES[section].image + 'large',
      menu: menu,
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
