var mongoose=require('mongoose');
var logger=require('./log').logger;
mongoose.connect('mongodb://zj:123@123.57.47.117:27017/FBDL');//mongodb://Server:yy@localhost:27017/PLCDB
var db = mongoose.connection;
db.on('error',(err)=>logger.error(err));
db.once('open',(callback)=>logger.trace(`数据库打开成功`));
var Schema=mongoose.Schema;
var userSchema=new Schema({
	name:String,
	value:Number,
	Svalue:String,
	date:{ type: Date, default: Date.now }
});
exports.AlarmHistory=db.model("alarmhistories",new Schema({
	Name:String,Var:String,Priority:String,Descr:String,DataType:String,Symbol:String,
	CurValue:Number,
	date:{type:Date,default:Date.now}
}))
exports.CreateDBlist=function(DataItem){
	var dblist={};
	for(var i=0;i<DataItem.length;i++){
//dblist[DataItem[i].DBName]=db.model(DataItem[i].DBName,userSchema);
dblist[DataItem[i]]=db.model(DataItem[i],userSchema);
	}
	return dblist;
}//根据配置文件DataItem生成DBLIST


function CalDate(start,end,unit,callback){
	var DateResult=[];
	var start=new Date(start);
	var end=new Date(end);	
	if(unit=="Y"){
		var da1=start.valueOf();
	var da2=start;
	for(var i=0;Date.parse(da2)<Date.parse(end);i++){
	da2.setFullYear(da2.getFullYear()+1);
	DateResult.push({start:da1,end:da2.valueOf()})
	da1=da2.valueOf();
	}
	if(DateResult.length==0){
		DateResult.push({start:da1})
	}
	DateResult[DateResult.length-1].end=end.valueOf();
	callback(DateResult);
	}
	
else if(unit=="S"){
	var da1=start.valueOf();
	var da2=start;
	for(var i=0;Date.parse(da2)<Date.parse(end);i++){
	da2.setMonth(da2.getMonth()+3);
	DateResult.push({start:da1,end:da2.valueOf()})
	da1=da2.valueOf();
	}
	if(DateResult.length==0){
		DateResult.push({start:da1})
	}
	DateResult[DateResult.length-1].end=end.valueOf();
	callback(DateResult);
}
else if(unit=="M"){

	var da1=start.valueOf();
	var da2=start;
	for(var i=0;Date.parse(da2)<Date.parse(end);i++){
	da2.setMonth(da2.getMonth()+1);
	DateResult.push({start:da1,end:da2.valueOf()})
	da1=da2.valueOf();
	}
	if(DateResult.length==0){
		DateResult.push({start:da1})
	}
	DateResult[DateResult.length-1].end=end.valueOf();
	callback(DateResult);
}

else if(unit=="W"){
	var da1=start.valueOf();
	var da2=start;
	for(var i=0;Date.parse(da2)<Date.parse(end);i++){
	da2.setDate(da2.getDate()+7);
	DateResult.push({start:da1,end:da2.valueOf()})
	da1=da2.valueOf();
	}
	if(DateResult.length==0){
		DateResult.push({start:da1})
	}
	DateResult[DateResult.length-1].end=end.valueOf();
	callback(DateResult);
}
else if(unit=="D"){
	var da1=start.valueOf();
	var da2=start;
	for(var i=0;Date.parse(da2)<Date.parse(end);i++){
	da2.setDate(da2.getDate()+1);
	DateResult.push({start:da1,end:da2.valueOf()})
	da1=da2.valueOf();
	}
	if(DateResult.length==0){
		DateResult.push({start:da1})
	}

	DateResult[DateResult.length-1].end=end.valueOf();
	callback(DateResult);
	
}
else if(unit=="H"){
	var da1=start.valueOf();
	var da2=start;
	for(var i=0;Date.parse(da2)<Date.parse(end);i++){
	da2.setHours(da2.getHours()+1);
	DateResult.push({start:da1,end:da2.valueOf()})
	da1=da2.valueOf();
	}
	if(DateResult.length==0){
		DateResult.push({start:da1})
	}
	DateResult[DateResult.length-1].end=end.valueOf();
	callback(DateResult);
}
else if(unit=="All"){
	DateResult.push({start:start.valueOf(),end:end.valueOf()});
	callback(DateResult);
}

}

function DBSum(db,name,start,end,type,callback){
	var res=[];
	var nj={};

		nj.Time=start;
		nj[name]=0;
		res.push({Time:start,name:name,value:0});

	
	if(type=="SUM"){
			db.aggregate([
 {$match: { name:name,date:{$gte:new Date(start),$lt:new Date(end)}}},
  {$group: {_id:"$name",_value: {$sum: "$value"}}}],function(err,mes){
	for(var i=0;i<mes.length;i++)
	{
		nj.Time=start;
		nj[mes[i]._id]=mes[i]._value;
	}
    callback(nj);
  
})
	}
	
else if(type=="PIE"){
		db.aggregate([
 {$match: { name:name,date:{$gte:new Date(start),$lt:new Date(end)}}},
  {$group: {_id:"$name",_value: {$sum: "$value"}}}],function(err,mes){
	for(var i=0;i<mes.length;i++)
	{
		nj.Time=start;
		nj[mes[i]._id]=mes[i]._value;
	}
    callback(nj);
  
})
		
	}
	
else if(type=="AVG"){
			db.aggregate([
 {$match: { name:name,date:{$gte:new Date(start),$lt:new Date(end)}}},
  {$group: {_id:"$name",_value: {$avg: "$value"}}}
],function(err,mes){
	for(var i=0;i<mes.length;i++)
	{
		nj.Time=start;
		nj[mes[i]._id]=(mes[i]._value).toFixed(5);
	}
    callback(nj);
	
  
})
			
	}
else if(type=="MIN"){
			db.aggregate([
 {$match: { name:name,date:{$gte:new Date(start),$lt:new Date(end)}}},
  {$group: {_id:"$name",_value: {$min: "$value"}}}
],function(err,mes){
	for(var i=0;i<mes.length;i++)
	{
		nj.Time=start;
		nj[mes[i]._id]=(mes[i]._value).toFixed(5);
	}
    callback(nj);
})
  
	}
else if(type=="MAX"){
			db.aggregate([
 {$match: { name:name,date:{$gte:new Date(start),$lt:new Date(end)}}},
  {$group: {_id:"$name",_value: {$max: "$value"}}}
],function(err,mes){
	for(var i=0;i<mes.length;i++)
	{
		nj.Time=start;
		nj[mes[i]._id]=(mes[i]._value).toFixed(5);
	}
    callback(nj);
	
  
})
  
	}
else if(type=="STRING"){
	db.find({name:name,date:{$gte:new Date(start),$lt:new Date(end)}},function(err,mes){
		callback(mes);
	})
}

}
var Query=function (db,name,start,end,unit,type,callback){

	CalDate(start,end,unit,function(res){
		var dataStruct=[];
		var sum=0;
		var num=0;
		for(var i=0;i<res.length;i++){
			DBSum(db,name,res[i].start,res[i].end,type,function(sum){
			
				
					dataStruct.push(sum);
				if(dataStruct.length==res.length){
					function sortdate(a,b){
						return  a.Time-b.Time;
					}
					
				dataStruct.sort(sortdate);
			setTimeout(function(){
					callback(dataStruct);
			},500)
				
				}	
			
				
				
			})
		}
	})
	
}

exports.Queryfun=function(dblist,obj,start,end,unit,callback){
	
	var resStuct=[];
	var name=[];
for(var i=0;i<obj.length;i++){
	name[i]=obj[i].name;
 var nameArr=obj[i].name.split('.');
var dbname="";
for(var j=0;j<2;j++){
	dbname+=nameArr[j];
	if(j==0){dbname+="."}
}
var type=obj[i].type;
var index=0;
if(dblist[dbname]===undefined){
	callback("DB Not Exist",unit);
	return;
}
console.log("########");
console.log(name[i],start,end,unit,type);
Query(dblist[dbname],name[i],start,end,unit,type,function(res){
	if(index==0)
	{
		for(var i=0;i<res.length;i++){
		resStuct.push(res[i]);
	}
	}
	else{
		for(var j=0;j<res.length;j++){
		for(var key in res[j]){
			if(key!="Time"){
				resStuct[j][key]=res[j][key];
			}
			
		}
		
	}
	}
	index+=1;
	
if(index==obj.length){
	
	if(type=="PIE"){
		var sum=0;
	for(var k=0;k<resStuct.length;k++){
		for(var key in resStuct[k]){
			if(key!="Time") {
			    sum+=resStuct[k][key];
			}
		
		}
	};
	setTimeout(function(){
		for(var h=0;h<resStuct.length;h++){
		for(var nkey in resStuct[h]){
			if(nkey!="Time") 
			{
			resStuct[h][nkey]=(resStuct[h][nkey]/sum).toFixed(5);	
			}
			
		}
	};
	callback(resStuct,unit);
	},500)
	
	
	}
else{
	 callback(resStuct,unit);
}
 
}
})

}


}
