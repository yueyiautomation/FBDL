var fs=require('fs');
exports.walk=function (dir) {  
    var children = []  
    fs.readdirSync(dir).forEach(function(filename){  
        var path = dir+"/"+filename  
        var stat = fs.statSync(path)  
        if (stat && stat.isDirectory()) {  
            children = children.concat(module.exports.walk(path))  
        }  
        else {  
            children.push(path)  
        }  
    })  
  
    return children ;
} 

exports.FindSys=function (dir,name){
var children=[];
    fs.readdirSync(dir).forEach(function(filename){  
        var path = dir+"/"+filename;
        var houzhui=filename.split('.');
        if(houzhui[houzhui.length-1]==name){
        	children.push(path);
        }
        var stat = fs.statSync(path);
        if (stat && stat.isDirectory()) {  
            children = children.concat(module.exports.FindSys(path,name));
        }  
    })  
    return children;

}
