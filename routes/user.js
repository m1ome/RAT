
/*
 * GET users listing.
 */

exports.list = function(req, res){
  res.send("respond with a resource");
};

exports.layout = function(req, res) {
    res.render('layout');
};