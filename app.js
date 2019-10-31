const express = require('express');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.status(200).render('home');
});

const civ3routes = require('./routes/civ3civilopedia/routing.js');
app.use('/civilopedia', civ3routes);

const utilroutes = require('./routes/utilroutes.js');
app.use('/', utilroutes);

app.use('*', function(req, res) {
  res.status(404).send('404 Not Found');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('500 Server Error')
})

app.listen(4000, () => console.log('Running on port 4000'));
