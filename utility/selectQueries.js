require("../utility/constant");
var validator = require('validator');
const qry1 = require(`${PROJECT_DIR}/utility/userConsoleLogs`);
var validation = require(`${PROJECT_DIR}/utility/validation`);
const sort = require(`${PROJECT_DIR}/utility/sort`);

module.exports = {
    selectAllQuery,
    SelectAllQry,
    SelectWithSubAllQry,
    fetchAllWithJoinQry,
    getDbResult,
    agentDetail,
    insertRecord,
    updateRecord,
    deleteRecord,
    getLocationAddr,
    getAsmHirarchy,
    insertManyRecord,
    insertManyRecordCustom,
    clearTable,
    getThroughSfid,
    getPriorityOfApproval,
    getAllTeamIds,
    getTeamsData,
    getAccountThroughArea,
    getAccountThroughAreaAndBrand,
    getAccountThroughBrand,
    getSfidThroghPgid,
};

/**
 * 
 * @param {*} fieldsArray, tableName, WhereClouse, offset, limit, orderBy 
 * @param {*} tableName 
 * @param {*} WhereClouse 
 * @param {*} offset 
 * @param {*} limit 
 * @param {*} orderBy 
 */

function selectAllQuery(param) {

    var fields = param.fields.toString();
    var WhereClouse = param.WhereClouse;
    var tableName = param.tableName;
    var offset = param.offset;
    var limit = param.limit;
    var orderBy = param.orderBy;
    var sql = `SELECT ${fields} FROM ${process.env.TABLE_SCHEMA_NAME}.${tableName}`;
    
    if (WhereClouse != undefined && WhereClouse.length > 0) {
        sql+= ' where';
        
        var couter = 0;
        WhereClouse.forEach(element => {
            if(couter > 0){
                sql+= ' and';
            }
            console.log("sql", sql);
            if(validation.issetNotEmpty(element.type)){
                switch(element.type){
                    case 'IN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} IN ('${teamsMemString}')`;
                    break;
                    case 'NOTIN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} NOT IN ('${teamsMemString}')`;
                    break;
                    case 'LIKE':
                        sql+=` ${element.fieldName} LIKE '%${element.fieldValue}%'`;
                    break;  
                    case 'GTE':
                        sql+=` ${element.fieldName} >= '${element.fieldValue}'`;
                    break;  
                    case 'LTE':
                        sql+=` ${element.fieldName} <= '${element.fieldValue}'`;
                    break;  
                    case 'BETWEEN':
                        sql+=` ${element.fieldName} BETWEEN ${element.fieldValue}`;
                    break; 
                    case 'NOTNULL':
                        sql+=` ${element.fieldName} is not null`;
                    break;   
                }
            }else{
                sql+=` ${element.fieldName}='${element.fieldValue}'`;
            }
            couter++;
        });
    }

    if(validation.issetNotEmpty(orderBy)){
        sql+=` ${orderBy}`;
    }
    if(validation.issetNotEmpty(offset)){
        sql+=` offset ${offset}`;
    }
    if(validation.issetNotEmpty(limit)){
        sql+=` limit ${limit}`;
    }
    return sql;
}

function SelectAllQry(fieldsArray, tableName, WhereClouse, offset, limit, orderBy ) {
    var fields = fieldsArray.toString();
    var sql = `SELECT ${fields} FROM ${process.env.TABLE_SCHEMA_NAME}.${tableName}`;
    if (WhereClouse != undefined && WhereClouse.length > 0) {
        sql+= ` where`;
        
        var couter = 0;
        WhereClouse.forEach(element => {
            if(couter > 0){
                sql+= ` and`;
            }

            if(element.type!=undefined && element.type!=''){
                switch(element.type){
                    case 'IN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} IN ('${teamsMemString}')`;
                    break;
                    case 'NOTIN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} NOT IN ('${teamsMemString}')`;
                    break;
                    case 'LIKE':
                        sql+=` ${element.fieldName} LIKE '%${element.fieldValue}%'`;
                    break;  
                    case 'GTE':
                        sql+=` ${element.fieldName} >= '${element.fieldValue}'`;
                    break;  
                    case 'LTE':
                        sql+=` ${element.fieldName} <= '${element.fieldValue}'`;
                    break;
                    case 'LT':
                        sql+=` ${element.fieldName} < '${element.fieldValue}'`;
                    break;  
                    case 'BETWEEN':
                        sql+=` ${element.fieldName} BETWEEN '${element.fieldValue[0]}' AND '${element.fieldValue[1]}'`;
                    break; 
                    case 'NOTNULL':
                        sql+=` ${element.fieldName} is not null`;
                    break;
                    case 'NULL':
                        sql+=` ${element.fieldName} is null`;
                    break;
                    case 'NOTEQUAL':
                        sql+=` ${element.fieldName} <> '${element.fieldValue}'`;
                    break;   
                    
                }
            }else{
                sql+=` ${element.fieldName}='${element.fieldValue}'`;
            }
            couter++;
        });
    }

    console.log('orderBy >>>>> ',orderBy  )
    if(orderBy!=undefined && orderBy!=''){
        sql+=` ${orderBy}`;
    }
    if(offset!=undefined && validator.isInt(offset,{ min: 0, max: 9999999999999 })){
        sql+=` offset ${offset}`;
    }
    if(limit!=undefined && validator.isInt(limit,{ min: 0, max: 1000 })){
        sql+=` limit ${limit}`;
    }
    return sql;
}

function SelectWithSubAllQry(fieldsArray, subQuery, WhereClouse, offset, limit, orderBy ) {
    const fields = fieldsArray.toString();
    var sql = `SELECT ${fields} FROM ${subQuery}`;
    if (WhereClouse != undefined && WhereClouse.length > 0) {
        sql+= ` where`;
        
        var couter = 0;
        WhereClouse.forEach(element => {
            if(couter > 0){
                sql+= ` and`;
            }

            if(element.type!=undefined && element.type!=''){
                switch(element.type){
                    case 'IN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} IN ('${teamsMemString}')`;
                    break;
                    case 'LIKE':
                        sql+=` ${element.fieldName} LIKE '%${element.fieldValue}%'`;
                    break;  
                    case 'GTE':
                        sql+=` ${element.fieldName} >= '${element.fieldValue}'`;
                    break;  
                    case 'LTE':
                        sql+=` ${element.fieldName} <= '${element.fieldValue}'`;
                    break;  
                    case 'BETWEEN':
                        sql+=` ${element.fieldName} BETWEEN ${element.fieldValue}`;
                    break;   
                    case 'NOTNULL':
                        sql+=` ${element.fieldName} is not null`;
                    break;  
                }
            }else{
                sql+=` ${element.fieldName}='${element.fieldValue}'`;
            }
            couter++;
        });
    }

    console.log('orderBy >>>>> ',orderBy  )
    if(orderBy!=undefined && orderBy!=''){
        sql+=` ${orderBy}`;
    }
    if(offset!=undefined && validator.isInt(offset,{ min: 0, max: 9999999999999 })){
        sql+=` offset ${offset}`;
    }
    if(limit!=undefined && validator.isInt(limit,{ min: 0, max: 1000 })){
        sql+=` limit ${limit}`;
    }
    return sql;
}

function fetchAllWithJoinQry(fieldsArray, tableName,joins, WhereClouse, offset, limit, orderBy ) {
    const fields = fieldsArray.toString();
    var sql = `SELECT ${fields} FROM ${process.env.TABLE_SCHEMA_NAME}.${tableName}`;
    var joinString = ``;
    if (joins != undefined && joins.length > 0) {
       
        joins.forEach(async element => {
           
            joinString += ` ${element.type} JOIN ${process.env.TABLE_SCHEMA_NAME}.${element.table_name} ON ${element.p_table_field} = ${element.s_table_field}`;
            
        });
        sql+=joinString;
    }

    if (WhereClouse != undefined && WhereClouse.length > 0) {
        sql+=` where`;
        var couter = 0;
        WhereClouse.forEach(element => {
            if(couter > 0){
                sql += ` and`;
            }
            if(element.type!=undefined && element.type!=''){
                switch(element.type){
                    case 'IN':
                        teamsMemString = element.fieldValue.join("','");
                        sql+=` ${element.fieldName} IN ('${teamsMemString}')`;
                    break;
                    case 'LIKE':
                        sql+=` ${element.fieldName} LIKE '%${element.fieldValue}%'`;
                    break;  
                    case 'GTE':
                        sql+=` ${element.fieldName} >= '${element.fieldValue}'`;
                    break;
                    case 'GT':
                        sql+=` ${element.fieldName} > '${element.fieldValue}'`;
                    break;
                    case 'LT':
                        sql+=` ${element.fieldName} < '${element.fieldValue}'`;
                    break;
                    case 'LTE':
                        sql+=` ${element.fieldName} <= '${element.fieldValue}'`;
                    break;  
                    case 'BETWEEN':
                        sql+=` ${element.fieldName} BETWEEN ${element.fieldValue}`;
                    break;  
                    case 'NOTNULL':
                        sql+=` ${element.fieldName} is not null `;
                    break;  

                }
            }else{
                sql+=` ${element.fieldName}='${element.fieldValue}'`;
            }
            couter++;
        });
    }
    
    if(orderBy!=undefined && orderBy!=''){
        sql +=` ${orderBy}`;
    }
    if(offset!=undefined && validator.isInt(offset,{ min: 0, max: 9999999999999 })){
        sql+=` offset ${offset}`;
    }
    if(limit!=undefined && validator.isInt(limit,{ min: 0, max: 1000 })){
        sql+=` limit ${limit}`;
    }
    return sql;
}

async function getDbResult(sql) {
    return await client.query(sql)
        .then(data => {
            console.log('INFO::: Fetch DB result');
            return data;
        })
        .catch(err => {
            console.log('err ====>>>  ',err);
            return [];
        });
}

async function insertRecord(fieldsToBeInsert, fieldValues, tableName, returnIds){
   

    sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES(`;
    if(fieldValues.length > 0){
        var counter = 1;
        fieldValues.forEach(element => {
            if(counter > 1){ sql += `,`; }
            sql += `$${counter}`;
            counter++
        })
    }
    sql += `) RETURNING id`;
    if(returnIds!=undefined){
        sql +=` ${returnIds}`;
    }
    console.log('INFO ::::::  SQL::::  ', sql);
    return await client.query(sql,fieldValues)
        .then(data => { 
            console.log(` INFO::::: INSERT RESPONSE table =${tableName} >>>>> `,data)
            if(data.rowCount > 0){
                return { "success": true, "message": "", "data": data.rows };

            }else{
                return { "success": false, "message": "Error while create record. Please try again.", "data": {} };
            }
        }).catch(err => {
            let error_log = `Error :::::>>>>>>> 217 ::::::: ${err}`
            console.log(error_log);
            qry1.insertErrorLog(error_log,'insert', sql, fieldValues, tableName);
            return { "success": false, "message": "Error while insert", "data": {} };
        });

}

async function insertManyRecord(fieldsToBeInsert, fieldValues, tableName, returnIds){
   

    sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES`;
    if(fieldValues.length > 0){
        let counter = 1;  // for giving '(' / ')'
        let counter2 = 1;     // for giving ','
        fieldValues.forEach((fieldValue)=> {
            if(counter == 1){ 
                sql += `(`; 
            } else {
                sql += ',('
            }
            let data = Object.values(fieldValue);
            data.forEach(value => {
                if (counter2 == 1) {
                    sql += `'${value}'`;
                } else{
                    sql += `, '${value}'`;
                }
                counter2++
            })
            counter2 = 1;
            sql += `)`;
            counter++
        })
    }
    sql += ` RETURNING id`;
    if(returnIds!=undefined){
        sql +=` ${returnIds}`;
    }
    console.log('INFO ::::::  SQL::::  ', sql);
    return await client.query(sql)
        .then(data => { 
            console.log(` INFO::::: INSERT RESPONSE table =${tableName} >>>>> `,data)
            if(data.rowCount > 0){
                return { "success": true, "message": "", "data": data.rows };

            }else{
                return { "success": false, "message": "Error while create record. Please try again.", "data": {} };
            }
        }).catch(err => {
            let error_log = `Error :::::>>>>>>> 218 ::::::: ${err}`
            console.log(error_log);
            qry1.insertErrorLog(error_log,'insert', sql, fieldValues, tableName);
            return { "success": false, "message": "Error while insert", "data": {} };
        });

}

async function insertManyRecordCustom(fieldsToBeInsert, fieldValues, tableName, returnIds){
   

    sql = `INSERT into ${process.env.TABLE_SCHEMA_NAME}.${tableName} (${fieldsToBeInsert}) VALUES`;
    if(fieldValues.length > 0){
        let counter = 1;  // for giving '(' / ')'
        let counter2 = 1;     // for giving ','
        fieldValues.forEach((fieldValue)=> {
            if(counter == 1){ 
                sql += `(`; 
            } else {
                sql += ',('
            }
            let data = Object.values(fieldValue);
            data.forEach(value => {
                if (counter2 == 1) {
                    sql += `'${value}'`;
                } else{
                    sql += `, '${value}'`;
                }
                counter2++
            })
            counter2 = 1;
            sql += `)`;
            counter++
        })
    }
    sql += ` ON CONFLICT (sfid) 
    DO NOTHING RETURNING id`;
    if(returnIds!=undefined){
        sql +=` ${returnIds}`;
    }
    console.log('INFO ::::::  SQL::::  ', sql);
    return await client.query(sql)
        .then(data => { 
            console.log(` INFO::::: INSERT RESPONSE table =${tableName} >>>>> `,data)
            if(data.rowCount > 0){
                return { "success": true, "message": "", "data": data.rows };

            }else{
                return { "success": false, "message": "Error while create record. Please try again.", "data": {} };
            }
        }).catch(err => {
            console.log('Error::: Catch 162 >>>> ', err);
            return { "success": false, "message": "Error while insert", "data": {} };
        });

}

async function clearTable(tableName){
   

    let sql = `DELETE FROM ${process.env.TABLE_SCHEMA_NAME}.${tableName}`;

    console.log('INFO ::::::  SQL::::  ', sql);
    return await client.query(sql)
        .then(data => { 
            console.log(` INFO::::: DELETE TABLE DATA, table =${tableName}`)
            if(data.rowCount > 0){
                return { "success": true, "message": "", "data": data.rows };

            }else{
                return { "success": false, "message": "Error while deleting records. Please try again.", "data": {} };
            }
        }).catch(err => {
            console.log('Error::: Catch 142 >>>> ', err);
            return { "success": false, "message": "Error while deleting", "data": {} };
        });

}

async function updateRecord(tableName, fieldValue, WhereClouse){
    try {

        //sql = `update zoxima.${tableName} set End_Day__c='true', End_Time__c='${attendance_time}' where Team__c='${agentid}' and Attendance_Date__c='${attendance_date}'`;
        
         var sql = `update ${process.env.TABLE_SCHEMA_NAME}.${tableName} set`;


        counter = 1;
        fieldValue.forEach(element => {
            if(counter > 1)
                sql+=`,`;
            if(element.type!=undefined && element.type == 'BOOLEAN')
                sql +=` ${element.field}=${element.value}`;
            else
                sql +=` ${element.field}='${element.value}'`;
            counter++;
        });

        sql +=` where `;


        counter = 1;
        WhereClouse.forEach(element => {
            if(counter > 1)
                sql+=` and `;
            if(element.type!=undefined && element.type!=''){
               switch(element.type){
                case 'IN':
                    teamsMemString =element.value.join("','");
                    sql +=` ${element.field} IN ('${teamsMemString}')`;
                break;
                case 'NOTNULL':
                    sql+=` ${element.field} is not null `;
                break;
                case 'GT':
                    sql+=` ${element.fieldName} > '${element.fieldValue}'`;
                break;
                case 'LT':
                    sql+=` ${element.fieldName} < '${element.fieldValue}'`;
                break;
               }     
            }  else
                sql +=` ${element.field}='${element.value}'`;
            counter++;
        });

        console.log(`INFO::::: ${sql}`);

        return await client.query(sql)
            .then(data => {
                if(data.rowCount > 0){
                    return { "success": true, "message": "Record updated successfully.","data":data };
                }else{
                    return { "success": false, "message": "Record updated failed.","data":{} };
                }
            }).catch(err => {
                console.log('ERROR:::: err 143 >>>> ', err);
                return { "success": false, "message": "Error while update record." };
            });
    } catch (e) {
        console.log("Error :::::>>>> 143 ::::::",e)
        return { "success": false, "message": "Error while update record." };
    }
  
}

async function deleteRecord(tableName, WhereClouse){
    try {       
        
         var sql = `DELETE FROM ${process.env.TABLE_SCHEMA_NAME}.${tableName}`;       

        sql +=` where `;


        counter = 1;
        WhereClouse.forEach(element => {
            if(counter > 1)
                sql+=` and `;
            if(element.type!=undefined && element.type=='IN'){
                teamsMemString =element.value.join("','");
                sql +=` ${element.field} IN ('${teamsMemString}')`;
            }  else
                sql +=` ${element.field}='${element.value}'`;
            counter++;
        });

        console.log(`INFO::::: ${sql}`);

        return await client.query(sql)
            .then(data => {
                if(data.rowCount > 0){
                    return { "success": true, "message": "Record deleted successfully.","data":data };
                }else{
                    return { "success": false, "message": "Record deleted failed.","data":{} };
                }
            }).catch(err => {
                console.log('ERROR:::: err 144 >>>> ', err);
                return { "success": false, "message": "Error while update record." };
            });
    } catch (e) {
        console.log("Error :::::::>>>>> 144 :::::",e)
        return { "success": false, "message": "Error while deleteing record." };
    }
  
}


async function agentDetail(agentId){
    if (validation.issetNotEmpty(agentId)) {
        fieldsArray = [
            `team__c.member_type__c as member_type`,
            `team__c.email__c as email`, `team__c.name as team_member_name`,
            `team__c.dob__c as dob`, `team__c.designation__c as designation`,
            `team__c.phone_no__c as phone_no`,
            `team__c.Business__c as business`,
            `team__c.Manager__c as manager_id`,
            `team__c.sfid as team_id`
        ];
        tableName = `team__c`;
        WhereClouse = [];
            WhereClouse.push({ "fieldName": "sfid", "fieldValue": agentId  })
        
        orderBy = '';
        var sql = SelectAllQry(fieldsArray, tableName, WhereClouse, '0', '1', orderBy );
        console.log(`INFO:::: GET AGENT DETAIL: ${sql}`);
        var result =  await getDbResult(sql);
        return result;
    }else{
        return false;
    }
}

//getAsmHirarchy('a0H1m000001Owv4EAC');
async function getAsmHirarchy(agentid) {
    var team = {};
    team['ASM'] = [];
    team['PSM'] = [];
    team['memberType'] = '';
    team['success'] = true;
    try {
        myDetails = await agentDetail(agentid);
        
        if (myDetails.rowCount > 0) {
            team['memberType'] = myDetails.rows[0].member_type;
            var sql = '';
            if (myDetails.rowCount > 0 && myDetails.rows[0].member_type == 'PSM') {
                team['PSM'].push(agentid)
            } else {
                sql = `WITH RECURSIVE subordinates AS (
                SELECT
                sfid,
                manager__c,
                name,
                member_type__c
                FROM
                cns.team__c
                WHERE
                sfid = '${agentid}'
                UNION
                SELECT
                    e.sfid,
                    e.manager__c,
                    e.name,
                    e.member_type__c
                FROM
                    cns.team__c e
                INNER JOIN subordinates s ON s.sfid = e.manager__c
            ) SELECT
                *
            FROM
                subordinates`;
                var result = await getDbResult(sql);
                if (result.rows.length > 0) {
                    for (i in result.rows) {
                        if (result.rows[i].member_type__c == 'PSM') {
                            team['PSM'].push(result.rows[i].sfid);
                        } else {
                            team['ASM'].push(result.rows[i].sfid);
                        }
                    }
                }else{
                    team['success'] = false;
                }
            }
            
            console.log('result  > ', team)
            return team;
        }
    } catch (e) {
        team['success'] = false;
        return team;
    }
}



var rp = require('request-promise');
//getLocationAddr('28.5796079','77.3386758')
async function getLocationAddr(lat, long) {
    if (lat != null && lat != '' && long != null && long != '') {
        return rp(`https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${long}&key=${process.env.GOOGLE_API_KEY}`)
            .then(async function (data) {

                data = JSON.parse(data);

                var isResultFound = false, address = 'N/A';
                if (data != undefined && data.results.length > 0) {
                    for (i in data.results) {
                        if (isResultFound == false) {

                            for (j in data.results[i].address_components) {
                                if (data.results[i].geometry.location_type == 'GEOMETRIC_CENTER' && isResultFound == false) {
                                    isResultFound = true;
                                    address = data.results[i].formatted_address;
                                }
                            }
                        }
                    }
                }
                return address;
            })
            .catch(function (err) {
                console.log(err);
                // Crawling failed...
            });
    } else {
        return 'N/A';
    }
}


async function getThroughSfid(tablename, sfid) {
  let fields = ['*'];
  let wehereClouse = [];
  wehereClouse.push({ fieldName: 'sfid', fieldValue: sfid });
  let sql = SelectAllQry(fields, tablename, wehereClouse);
  let data = await client.query(sql);
  if (data.rows.length) {
    return data.rows[0];
  } else {
    return;
  }
}

function getPriorityOfApproval(designation) {
// teams designation: Director, CGM, GM, AGM, ASM, MO
  let priority;
  switch (designation) {
    case 'Director':
      priority = 4;
      break;
    case 'CGM':
      priority = 3;
      break;
    case 'GM':
      priority = 2;
      break;
    case 'AGM':
      priority = 1;
      break;

    default:
      priority = 0;
      break;
  }
  return priority;
}

async function getAllTeamIds(sfid) {
  let final_team = [sfid];
  for (let i = 0; i < ITR_LEVEL; i++) {
    if (i == 0) {
      recent_data = [...final_team];
    }
    if (recent_data.length > 0) {
      const fields = ['sfid'];
      const tableName = 'team__c';
      const WhereClouse = [];
      WhereClouse.push({ fieldName: 'manager_id__c', fieldValue: recent_data, type: 'IN' });

      let offset = '0',
        limit = '1000';

      let sql = SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
      let teams = await client.query(sql);
      recent_data = [];
      if (teams.rows.length > 0) {
        teams.rows.map((team) => {
          recent_data.push(team['sfid']);
          final_team.push(team['sfid']);
        });
      }
    }
  }
  return sort.removeDuplicates(final_team);
}

async function getTeamsData(teamsfids, column) {
  const fields = [column];
  const tablename = SF_TEAM_AREA_TABLE_NAME;
  const whereClouse = [];
  whereClouse.push({ fieldName: 'team__c', fieldValue: teamsfids, type: 'IN' });
  let offset = '0',
    limit = '1000';
  let get_team_data_sql = SelectAllQry(fields, tablename, whereClouse, offset, limit, ' order by createddate desc');
  let get_team_data_result = await client.query(get_team_data_sql);
  let data_final = [];
  get_team_data_result.rows.map((data) => {
    data_final.push(data[column]);
  });
  return sort.removeDuplicates(data_final);
}

async function getAccountThroughArea(areasfids) {
  const fields = ['sfid'];
  const tablename = SF_ACCOUNT_TABLE_NAME;
  const whereClouse = [];
  whereClouse.push({ fieldName: 'area__c', fieldValue: areasfids, type: 'IN' });
  let offset = '0',
    limit = '1000';
  let sql = SelectAllQry(fields, tablename, whereClouse, offset, limit, ' order by createddate desc');
  let accounts = await client.query(sql);
  return sort.removeDuplicates(accounts.rows.map((account) => account['sfid']));
}

async function getAccountThroughAreaAndBrand(areasfids, brand__c) {

    const fields = ['account.sfid'];
    const tablename = SF_ACCOUNT_TABLE_NAME;
    const whereClouse = [];
    whereClouse.push({ fieldName: 'account.area__c', fieldValue: areasfids, type: 'IN' });
    whereClouse.push({ fieldName: 'account_brand_mapping__c.brand__c', fieldValue: brand__c });
    let offset = '0',
      limit = '1000';
    const joins = [
        {
            type: 'LEFT',
            table_name: 'account_brand_mapping__c',
            p_table_field: `account.sfid`,
            s_table_field: 'account_brand_mapping__c.account__c',
        }
    ];
    let sql = fetchAllWithJoinQry(fields, tablename, joins, whereClouse, offset, limit, ' order by account.createddate desc');
    console.log('sql ::::::::::::::::::::::::', sql);
    let accounts = await client.query(sql);
    return sort.removeDuplicates(accounts.rows.map((account) => account['sfid']));
}

async function getAccountThroughBrand(brandsfids) {
  const fields = ['account.sfid'];
  const tablename = SF_ACCOUNT_TABLE_NAME;
  const whereClouse = [];
  whereClouse.push({ fieldName: 'account_brand_mapping__c.brand__c', fieldValue: brandsfids, type: 'IN' });
  let joins = [
    {
      type: 'LEFT',
      table_name: 'account_brand_mapping__c',
      p_table_field: `account.sfid`,
      s_table_field: `account_brand_mapping__c.account__c`,
    },
  ];
  let offset = '0',
    limit = '1000';
  let sql = fetchAllWithJoinQry(fields, tablename, joins, whereClouse, offset, limit, ' order by account.createddate desc');
  let accounts = await client.query(sql);
  return sort.removeDuplicates(accounts.rows.map((account) => account['sfid']));
}

async function getSfidThroghPgid(tableName,pg_id__c) {
  let exit_jugad = false,
    sfid;
  const fields = ['*'],
    offset = '0',
    limit = '1',
    WhereClouse = [];

  WhereClouse.push({ fieldName: 'pg_id__c', fieldValue: pg_id__c });

  const sql = SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
  for (let z = 0; z < 15; z++) {
    if (exit_jugad == false) {
      const sql_resp = await client.query(sql);
      if (sql_resp.rows && sql_resp.rows[0]['sfid']) {
        sfid = sql_resp.rows[0]['sfid'];
        exit_jugad = true;
      }
    }
  }
  return sfid;
}
