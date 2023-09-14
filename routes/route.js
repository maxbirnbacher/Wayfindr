var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    // get the url parameter destination
    var destination = req.query.destination;
    // get the url parameter travelmode
    var travelmode = req.query.travelmode;
    console.log(destination);
    console.log(travelmode);
    res.render('route', { title: 'Route', destination: destination, travelmode: travelmode },);
});

module.exports = router;
