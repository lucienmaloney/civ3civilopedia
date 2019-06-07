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

const VIEWS = {
  bldg: 'improvement',
  tech: 'advances',
  prto: 'unit',
  good: 'resources',
  gvmt: 'government',
  terr: 'terrain',
  tfrm: 'actions',
  race: 'concepts',
  gcon: 'concepts',
  menu: 'concepts',
};

const NAMES = {
  race: 'Tribes',
  tech: 'Civilization Advances',
  gwdr: 'Great Wonders',
  swdr: 'Small Wonders',
  bldg: 'City Improvements',
  gvmt: 'Governments',
  prto: 'Units',
  tfrm: 'Worker Actions',
  terr: 'Terrain',
  good: 'Resources',
  gcon: 'Game Concepts',
};

const CIVILOPEDIA_JSON = require('./public/civ3complete.json');

app.get('/civilopedia', function(req, res, next) {
  const keys = Object.keys(NAMES);
  let links = keys.map(k => {
    return `<a href="/civilopedia/${k}">${NAMES[k]}</a>`;
  });

  res.status(200).render(VIEWS.gcon, {
    text: links.join('\n'),
    header: 'Main Menu',
  });
});

app.get('/civilopedia/:section', function(req, res, next) {
  const section = (req.params.section || '').toLowerCase();

  if (NAMES[section]) {
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

    res.status(200).render(VIEWS.menu, {
      header: NAMES[section],
      text: links.join('\n'),
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

    res.status(200).render(VIEWS[section], {
      text: Civ.parseText(data.text),
      header: data.name,
    });
  } else {
    next();
  }
});

app.use('*', function(req, res) {
  res.status(404).send('404 Not Found');
});

app.listen(4000, () => console.log('Running on port 4000'));
