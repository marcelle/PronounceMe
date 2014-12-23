var express = require('express');
var router = express.Router();

router.get('/', function(req, res) {
  res.render('index', {});
});

router.get('/searchitems', function(req, res) {
    var db = req.db;
    var collection = db.get('AllPronunciations');

    if (req.query.q) {
        var query = {
          phrase: {
            $regex: req.query.q,
            $options: 'i'
          }
        };

        collection.find(query, {}, function(e,results){
           res.render('searchitems', {
                "q" : req.query.q,
                "results" : results || []
            });
        });
    } else {
        collection.find({},{},function(e,results){
            res.render('searchitems', {
                "q" : req.query.q,
                "results" : results || []
            });
        });
    }
});

router.get('/additem', function(req, res) {
    res.render('additem', {});
});

router.post('/additem', function(req, res) {
    // Set our internal DB variable
    var db = req.db;

    var phrase = req.body.phrase;
    var contributor = req.body.contributor;
    var language = req.body.language;
    var region = req.body.region;
    var comment = req.body.comment;
    var file = req.body.file;
    var added = new Date();

    // Set our collection
    var collection = db.get('AllPronunciations');

    // Submit to the DB
    collection.insert({
        "phrase" : phrase,
        "contributor" : contributor,
        "language" : language,
        "region" : region,
        "comment" : comment,
        "file" : file,
        "added" : added
    }, function (err, item) {
        if (err) {
            // If it failed, return error
            res.send("There was a problem adding the pronunciation to the database.");
        }
        else {
            res.location("/viewitem/"+item._id);
            res.redirect("/viewitem/"+item._id);
        }
    });
});

router.get('/viewitem/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('AllPronunciations');
    var id = req.params.id;
    collection.findById(id, function(err, item) {
        if (err) {
            res.render('error', {
                message: err.message,
                error: err
            });
        } else if (item) {
            res.render('viewitem', {'item' : item});
        } else {
            res.render('error', {
                message: "Not found",
                error: 404
            });
        }
    });    
});

router.post('/deleteitem/:id', function(req, res) {
    var db = req.db;
    var collection = db.get('AllPronunciations');
    var id = req.params.id;
    collection.findById(id, function(err, item) {
        if (err) {
            res.render('error', {
                message: err.message,
                error: err
            });
        } else if (item) {
            collection.remove(item);
            res.location("/searchitems");
            res.redirect("/searchitems");
        } else {
            res.render('error', {
                message: "Not found",
                error: 404
            });
        }
    });    
});

module.exports = router;
