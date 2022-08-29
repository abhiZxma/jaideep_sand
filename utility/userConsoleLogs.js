var validator = require('validator');
var validation = require(`${PROJECT_DIR}/utility/validation`);
var fs = require('fs');
const dtUtil=require('./dateUtility.js')
module.exports = {
    errorlog,
    insertErrorLog
};


async function errorlog(data,file_name,query_params,header_params,body_params,url){
    //let unique_name = new Date().getTime();
    //console.log('Value ----->',unique_name);
    if(!data){
        //console.log('If Part');
        return 'No Data';
    }else{
        //console.log('Else Part',data,'QP--',query_params,'HP--',header_params , 'BP---',body_params);
        // let new_param = JSON.stringify(query_params)
        // console.log('value--',new_param);
        // To Write Error In Unique Files
        // fs.writeFile(`./console_errors/${unique_name}.txt`,data,()=>{
        //     return 'File Write Success';
        // });
        // To Write All Error In Same File In Appended Form 
        fs.writeFile(`./console_errors/${file_name}.txt`,"API Name --->" + url + '\n' + "Query Params --->" + JSON.stringify(query_params) +'\n' + "Header Token --->" + header_params +'\n' + "Body Params --->" + JSON.stringify(body_params) + '\n' + "Error --->" + data + '\n' + '\r\n\n',{ flag: "a" },()=>{
            return 'File Write Success';
        });
    }
}




module.exports = {
    errorlog,
    insertErrorLog,
    print
};


async function errorlog(data,file_name,query_params,header_params,body_params,url){
    //let unique_name = new Date().getTime();
    //console.log('Value ----->',unique_name);
    if(!data){
        //console.log('If Part');
        return 'No Data';
    }else{
        //console.log('Else Part',data,'QP--',query_params,'HP--',header_params , 'BP---',body_params);
        // let new_param = JSON.stringify(query_params)
        // console.log('value--',new_param);
        // To Write Error In Unique Files
        // fs.writeFile(`./console_errors/${unique_name}.txt`,data,()=>{
        //     return 'File Write Success';
        // });
        // To Write All Error In Same File In Appended Form 
        fs.writeFile(`./console_errors/${file_name}.txt`,"API Name --->" + url + '\n' + "Query Params --->" + JSON.stringify(query_params) +'\n' + "Header Token --->" + header_params +'\n' + "Body Params --->" + JSON.stringify(body_params) + '\n' + "Error --->" + data + '\n' + '\r\n\n',{ flag: "a" },()=>{
            return 'File Write Success';
        });
    }
}

async function insertErrorLog(data,file_name, sql, fieldValues, tableName){
    if(!data){
        return 'No Data';
    }else{
        fs.writeFile(`./console_errors/${file_name}.txt`,"Table Name --->" + tableName + '\n' + "SQL --->" + sql +'\n' + "Data --->" + fieldValues +'\n' + "Time --->" + new Date() + '\n' + "Error --->" + data + '\n' + '\r\n\n',{ flag: "a" },()=>{
            return 'File Write Success';
        });
    }
}


async function print(rawData,data='') {
    try {
        let todayDate=dtUtil.todayDate();
        let currentHour=new Date().getHours();
        let myFileName=`${todayDate}_${currentHour}`
          fs.appendFile(`./temp/logs/${myFileName}.txt`, `'${rawData}'`+ "\n",(err)=> {
            if (err) throw err;
            console.log(`log data saved in /temp/logs/${myFileName}.txt`);
          });
    } catch (e) {
        console.log("Eror",e)
        // throw error and send it over email

    }
}


async function insertErrorLog(data,file_name, sql, fieldValues, tableName){
    if(!data){
        return 'No Data';
    }else{
        fs.writeFile(`./console_errors/${file_name}.txt`,"Table Name --->" + tableName + '\n' + "SQL --->" + sql +'\n' + "Data --->" + fieldValues +'\n' + "Time --->" + new Date() + '\n' + "Error --->" + data + '\n' + '\r\n\n',{ flag: "a" },()=>{
            return 'File Write Success';
        });
    }
}