
/*
 * GET home page.
 */

exports.index = function(req, res){
  res.render('index', { title: 'Express', user : req.user })
};

exports.secret = function(req, res) {
   res.render('secret',{});
};
