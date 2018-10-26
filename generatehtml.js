const fs = require('fs');
const path=require('path');
var colors = require("colors")
const ATEMPLATE=' <a href="{#}" target="_blank">{#}</a><br>';



function generateIndex(exampleDir){
    exampleDir=exampleDir||'examples';
    let pathdir=path.join(__dirname,exampleDir);
    var files=fs.readdirSync(pathdir);
    if(files&&Array.isArray(files)){
        let as='';
        files.forEach(element => {
            if(element.indexOf('.html')>-1||element.indexOf('.htm')>-1)
                as+=ATEMPLATE.replace('{#}',element).replace('{#}',element);
        });
        generateHtml(as,exampleDir);
    }

}

function generateHtml(html,exampleDir){
    let examplesPath=path.join(__dirname,'EAMPLE_TEMPLATE.html');
    let exampleHtml=fs.readFileSync(examplesPath);
    exampleHtml=exampleHtml.toString().replace('{{examples}}',html);
    let exampleIndexPath=path.join(__dirname,exampleDir+'/index.html');
    try{
        fs.writeFileSync(exampleIndexPath,exampleHtml);
        console.warn('generate index.html success'.green);
    }catch(err){
        console.error('generate index.html fail'.red,err);
    }
}

module.exports={generateIndex:generateIndex}

