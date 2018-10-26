var express = require('express');
var app = express();

const pkg=require('./package.json');
const generate=require('./generatehtml');

const  exampleDir=pkg.static||'examples';

app.use(express.static(exampleDir));
app.use('/node_modules', express.static('node_modules'));
app.use('/dist', express.static('dist'));

var server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port;
  
    console.log('Example Express listening at http://%s:%s', host, port);
    generate.generateIndex(exampleDir);
});



