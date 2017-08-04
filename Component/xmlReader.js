var select = require('xpath.js');
var fs=require('fs');
var DOMParser = require('xmldom').DOMParser;
var FBDL={};
exports.XmlReader=function(name,config){

	var doc=new DOMParser().parseFromString(fs.readFileSync(name,'utf-8'));
	var Result={};
    var Name=select(doc,'/System/@Name')[0].value;
    var Device=select(doc,"//Device[@Type='FBDL']")[0];
    var AlarmList=select(doc,"//AlarmItem");
    var DateItemList=select(doc,"//DataItem");
    var report=select(doc,"//ReportItem");
    if(Device===undefined){
    	return "FBDL Not Find"
    }
    

    FBDL={Name:Name,
    IP:select(Device,"//Parameter[@Name='Address']/@Value")[0].value,
    MGTPort:Number(select(Device,"//Parameter[@Name='MGTPort']/@Value")[0].value),
    TCPPort:Number(select(Device,"//Parameter[@Name='TCPPort']/@Value")[0].value),
    HTTPPort:Number(select(Device,"//Parameter[@Name='HTTPPort']/@Value")[0].value),
    UDPPort:Number(select(Device,"//Parameter[@Name='UDPPort']/@Value")[0].value), 	
    WsPort:config.WsPort
 }
    
    
   FBDL.Alarm= GenerateAlarm(AlarmList)
   FBDL.Report= GenerateReport(report);
// /GenerateDataSource(report);
var DataItems=GenerateDataItems(DateItemList);
   FBDL.DataItem=DataItems.Datalist;
   FBDL.DBName=DataItems.DBName;
   return FBDL;
   
}

function GenerateAlarm(xml){
	var Alarm=[];
	for(var i=0;i<xml.length;i++){
	Alarm.push({Name:select(xml[i],'@Name')[0].value,Var:select(xml[i],'@Var')[0].value,
	Symbol:select(xml[i],'@Symbol')[0].value+select(xml[i],'@Value')[0].value,Priority:select(xml[i],'@Priority')[0].value,
	Descr:select(xml[i],'@Descr')[0].value,DataType:select(xml[i],'@DataType')[0].value
	});
	}
	return Alarm;
}
function GenerateDataItems(xml){
	
	var Datalist=[];
    var DBName=[];
	for(var i=0;i<xml.length;i++){
		var	Name=select(xml[i],'@Name')[0].value;
		Datalist.push({Name:select(xml[i],'@Name')[0].value,FBType:select(xml[i],'@FBType')[0].value,
		VarType:select(xml[i],'@VarType')[0].value
	})
		GenerateDBName(Name,DBName);
}
	return {Datalist:Datalist,DBName:DBName};
}


function GenerateDBName(VarType,obj){
    var nameArr=VarType.split('.');
	var dbname="";
    for(var j=0;j<2;j++){
	dbname+=nameArr[j];
	if(j==0){dbname+="."}
   }
   if (obj.indexOf(dbname)<0)
   obj.push(dbname);
return obj;
}

function GenerateReport(xml){
	var reportobj=[];
	for(var i=0;i<xml.length;i++){
    var name=select(xml[i],'@Name')[0].value;
    var reportaddr=FBDL.IP+"/Report?="+name;
   
   
	reportobj.push({Name:name,reportaddr:reportaddr,
    PanelCompomet:GeneratePanelCompomet(xml[i])
	}
	)
	
	var HmtlData=select(xml[i],"//ReportHTML[1]/text()")[0].data;
//	HmtlData=HmtlData.replace(/(\[<%|<%)(.*)(%>\]|%>)/g,"<%-$2%>");
	fs.writeFileSync("./App/views/include/"+name+".ejs",HmtlData); 
}
	return reportobj;
}


function GeneratePanelCompomet(xml){
var DataItem=[];
var PanelCompomet=select(xml,"PanelComponent");

PanelCompomet.forEach(function(xvalue,index){
	var DataSource=select(xvalue,"DataSource");
	DataItem.push({Id:select(xvalue,"PanelParameter[@Name='id']/@Value")[0].value,Type:select(xvalue,"@Type")[0].value,
	DataSource:GenerateDataSource(DataSource)});
	
})
return DataItem;
}


function GenerateDataSource(xml){
	var DataItem=[];
for(var i=0;i<xml.length;i++){
	DataItem.push({Name:select(xml[i],"@Name")[0].value,Binding:select(xml[i],"@Binding")[0].value,
	Function:select(xml[i],"@Function")[0].value,Style:select(xml[i],"@Style")[0].value,DisplayText:select(xml[i],"@DisplayText")[0].value})
}
return DataItem;
}
