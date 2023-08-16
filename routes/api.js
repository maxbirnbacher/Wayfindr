var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/business-details/:longitude/:latitude/:term', function(req, res, next) {
    let longitude = req.params.longitude;
    let latitude = req.params.latitude;
    let term = req.params.term;

    const sdk = require('api')('@yelp-developers/v1.0#z7c5z2vlkqskzd6');

    sdk.auth('Bearer ' + process.env.YELP_API_KEY);
    sdk.v3_business_search({
        latitude: latitude,
        longitude: longitude,
        term: term,
        radius: '50',
        categories: '',
        sort_by: 'best_match',
        limit: '20'
    })
        .then(({ data }) => {
            console.log(data);
            res.send(data);
            return data;
    })
        .catch(err => console.error(err));
});
      
module.exports = router;