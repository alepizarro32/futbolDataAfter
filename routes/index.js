var express = require('express');
const { index } = require('../controllers/indexController');
var router = express.Router();
const indexController = require ('../controllers/indexController')

/* GET home page. */

router.get('/',indexController.index);

module.exports = router;
