const fs = require('fs');
const router = require('express').Router();

router.get('/civ3decompressor', function(req, res) {
  res.status(200).render('utils/civ3decompressor');
});

module.exports = router;
