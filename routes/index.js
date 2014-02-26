
/*
 * GET home page.
 */

exports.index = function(req, res){
    console.log(res.locals);
    res.render('index', { title: 'Express' });
};