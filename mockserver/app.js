var express = require('express'),
        _ = require('lodash'),
        bodyParser = require('body-parser');
    
var app = exports = module.exports = express();

app.enable('trust proxy');
app.disable('x-powered-by');
app.enable('strict routing');


app.use(bodyParser.json());       // to support JSON-encoded bodies
app.use(bodyParser.urlencoded({extended: false}));


var html_dir = __dirname + '/public/';
app.use(express.static(html_dir));

app.get('/:commandApi/:username', function(req, res, next){
      res.sendfile(html_dir + 'buddies.html');
})

app.listen("3232");
  