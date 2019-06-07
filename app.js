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

const CIVILOPEDIA_JSON = require('./public/civ3complete.json');

app.get('/civilopedia', function(req, res, next) {
  res.status(200).render(VIEWS.gcon, {
    text: 'Main Menu',
    header: 'Main Menu',
  });
});

app.get('/civilopedia/:section', function(req, res, next) {
  fs.readFile('public/civ3/game_concepts_keys.txt', 'latin1', function(err, text) {
    if (err) {
      next(err);
      return 0;
    }

    res.status(200).render(VIEWS.gcon, {
      text: text,
      header: 'Sub Menu',
    });
  });
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
