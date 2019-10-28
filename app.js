const express = require('express');
const civ3routes = require('./civ3civilopedia/routing.js');

const app = express();

app.set('view engine', 'pug');
app.set('views', './views');

app.use(express.static('public'));

app.get('/', function(req, res) {
  res.status(200).render('index');
});

app.use('/civilopedia', civ3routes);

app.use('*', function(req, res) {
  res.status(404).send('404 Not Found');
});

app.use(function (err, req, res, next) {
  console.error(err.stack)
  res.status(500).send('500 Server Error')
})

app.listen(4000, () => console.log('Running on port 4000'));
