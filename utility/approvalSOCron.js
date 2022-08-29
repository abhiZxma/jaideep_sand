require("../utility/constant");
const cron = require('node-cron');

const qry = require(`${PROJECT_DIR}/utility/selectQueries`);
const qry1 = require(`${PROJECT_DIR}/utility/userConsoleLogs`);
let response = { "status": 200, "response": "" };
const dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
const uuidv4 = require('uuid/v4');
const { sendnotificationToDevice } = require(`${PROJECT_DIR}/utility/notifications`);
const notificationService = require(`${PROJECT_DIR}/controllers/notification/notification.service`);
const email = require(`${PROJECT_DIR}/utility/sendEmail.js`);
const {print}=require('./userConsoleLogs')
let queue = {};
const path=require('path')
const fs=require('fs')

/**
 * 
 * 
 *    if(!process.argv[2] ){
        let subject = `Error log for CenturyPly(${env1}) in API  ${url}`
        let text = ` API Name :  ` + url + '\n' + '\n' + `Request Body : ` + JSON.stringify(body_params) + '\n' + '\n' + `Query Params : ` + JSON.stringify(query_params) + '\n' + '\n' + `MESSAGE : ` + data + '\n' + '\n' + "Header Token --->" + header_params + '\n' + '\n' + "Header CLIENT-NAME --->" + header_params2
        await email.email_error_log(subject, text)
        }

 */


        /**
         *   "scripts": {
              "test": "echo \"Error: no test specified\" && exit 1",
              "start": "node app.js",
              "local": "nodemon app.js true"
            },
         */

const minute = 0;
const hour = 9;

function convertToPromise(type, id, reservation_id){
  if(type == 'insert'){
    return new Promise((resolve, reject)=> {
      client_queue.post("a089D000004nkvMQAQ,Approved By Distributor/Pending for Approval from Organization", function(error, body) {
          console.log(body);
          console.log(error);
          if(error == null || error == 'null' && body['id'] && body['reservation_id']){
              console.log('Inside Resolve Promise')
              console.log(body)
              resolve(body)
          }else {
              console.log('Inside Reject')
              console.log(error)
              reject(error)
          }
      });
  })
  }
  if(type == 'fetch'){
    return new Promise((resolve, reject)=> {
      client_queue.get({}, function(error, body) {
          console.log(body);
          console.log(error);
          if(error == null || error == 'null' && body['id'] && body['reservation_id']){
              console.log('Inside Resolve Promise')
              console.log(body)
              resolve(body)
          }else {
              console.log('Inside Reject')
              console.log(error)
              reject(error)
          }
      });
  })
  }
  if(type == 'delete'){
    return new Promise((resolve, reject)=> {
      client_queue.del(id, {reservation_id: reservation_id}, function(error, body) {
          console.log(body);
          console.log(error);
          if(error == null || error == 'null'){
              console.log('Inside Resolve Promise')
              resolve('done')
          }else {
              console.log('Inside Reject')
              console.log(error)
              reject(error)
          }
      });
  })
  }
}

const approvalSOCron = cron.schedule(
  `*/20 * * * * * `,
  async () => {
    try {
      let body = await convertToPromise('fetch');
      console.log(body)
      // client_queue.get({}, function(error, body) {
        console.log('Cron started');
        /**
         * {
            id: '7108551436160961920',
            body: 'Hello boy',
            reservation_id: '39b9d96fadac689e009c84a18221659d',
            reserved_count: 4,
            available_at: '2022-06-15T02:28:47.056656346Z'
            }
         */
        // if(error == null || error == 'null') {
            queue = body;
            if(body && body['id'] && body['reservation_id']){
              let order_id = body['body'].split(',')[0];
              let status = body['body'].split(',')[1];
 
                // Delete the message from queue
                let delete_message = await convertToPromise('delete', body['id'], body['reservation_id']);
                // client_queue.del(body['id'], {reservation_id: body['reservation_id']}, function(error, body) {
                //   console.log('Inside Del-----');
                //   console.log(error);
                //   console.log(body);
                // });
                // If there is anything in the queue, no else will be required.
                //@TODO Implement Approval Sales Order Logic here
                // Kindly add validation before updating any data in DB
                  // in this case kindly add sauda reference with sales order
                  // Get Order details from the DB order_id
                  console.log('Outside Del- Line 110 -------')
                  if (order_id.length > 20) {
                    console.log('Fetching Order Details from DB for PG_ID__C')
                    order_detail_sql = `select sauda_reference_no__c from ${process.env.TABLE_SCHEMA_NAME}.${SF_CUSTOM_ORDER_TABLE_NAME} where pg_id__c='${order_id}';`;
                  } else {
                      console.log('Fetching Order Details from DB for SFID')
                      order_detail_sql = `select sauda_reference_no__c from ${process.env.TABLE_SCHEMA_NAME}.${SF_CUSTOM_ORDER_TABLE_NAME} where sfid='${order_id}';`;
                  }
                  console.log('Started fetching data using query ----', order_detail_sql);
                  order_detail = await client.query(order_detail_sql)
                  console.log('Order data fetched from DB -------', order_detail)
              if (order_detail && order_detail.rows && order_detail.rows[0] && order_detail.rows[0]['sauda_reference_no__c']) {
                  let fieldValue = [],
                    whereClouse = [];
                  fieldValue.push({ field: 'order_status__c', value: status });
                  if (order_id.length > 20) {
                    whereClouse.push({ field: 'pg_id__c', value: order_id });
                  } else {
                    whereClouse.push({ field: 'sfid', value: order_id });
                  }
                  // whereClouse.push({ field: 'sauda_reference_no__c', type :'NOTNULL' });
                  const update_result = await qry.updateRecord(SF_CUSTOM_ORDER_TABLE_NAME, fieldValue, whereClouse);

                  //@TODO Harshit, status on email. Not required anymore. In future we can take care of this.
                  if (update_result.success) {
                    notificationService.salesOrderStatusUpdate(order_id);
                  } else {
                    notificationService.salesOrderStatusUpdate(order_id);
                  }
              } else {

                    let new_order_created = [];
                    let new_order_line_created = [];
                    let total_order_quantity = 0;
                    let task_done = false;
                    let sales_order = [];
                    let sauda_result = [];
                    let sauda_sfids = [];
                    let sales_order_qty = 0;
                    // let sauda_ref_arr = [];
                    // let sauda_ref_arr_count = 0;
                    let orderDetail, items;
                    let is_Validate = true;
                    let createddate = dtUtil.todayDatetime();
                    let insert_order = [];
                    let insert_order_line = [];

                    let order_detail_sql;
                    let order_detail;

                    let item_detail_sql;
                    let item_detail;
                    // Get Order Details
                    if (order_id.length > 20) {
                        order_detail_sql = `select * from ${process.env.TABLE_SCHEMA_NAME}.${SF_CUSTOM_ORDER_TABLE_NAME} where pg_id__c='${order_id}';`;
                    } else {
                        order_detail_sql = `select * from ${process.env.TABLE_SCHEMA_NAME}.${SF_CUSTOM_ORDER_TABLE_NAME} where sfid='${order_id}';`;
                    }
                    order_detail = await client.query(order_detail_sql);
                    console.log("order_detail_sql>>>>>>>>>>", order_detail_sql);
                    
                    
                    if (order_detail.rows.length > 0) {
                      console.log("order_detail>>>>>>>>>>", order_detail.rows);
                        // Get Order Line Details
                        if (order_detail.rows[0]['sfid']) {
                            item_detail_sql = `select * from ${process.env.TABLE_SCHEMA_NAME}.${SF_ORDER_LINE_TABLE_NAME} where order__c='${order_detail.rows[0]['sfid']}';`;
                        } else {
                            item_detail_sql = `select * from ${process.env.TABLE_SCHEMA_NAME}.${SF_ORDER_LINE_TABLE_NAME} where order_pg_id__c='${order_detail.rows[0]['pg_id__c']}';`;
                        }
                        item_detail = await client.query(item_detail_sql);
                        console.log("item_detail_sql>>>>>>>>>>", item_detail_sql);
                        
                        if (item_detail.rows.length>0) {
                          console.log("item_detail>>>>>>>>>>", item_detail.rows);
                            // Now check for existing sauda for distributor
                            let total_order_quantity = 0;
                            item_detail.rows.map((item) => {
                                total_order_quantity += item.quantity__c;
                            })

                            // Getting Sauda from DB for this distributor and also when dealer is attached
                            if(order_detail.rows[0]['dealer__c']){
                              let saudaFields = ['*']
                              let sauda_tablename = SF_SAUDA_TABLE_NAME;
                              const sauda_status = ['Approved','OverDue'];
                              const WhereClouse = [];
                              WhereClouse.push({ "fieldName": "distributor_name__c", "fieldValue": order_detail.rows[0]['sauda_party__c'] });
                              WhereClouse.push({ "fieldName": "dealer__c", "fieldValue": order_detail.rows[0]['dealer__c'] });
                              WhereClouse.push({ "fieldName": "sauda_status__c", "fieldValue": sauda_status,type: 'IN' });
                              

                              let offset = '0', limit = '1000';
                              let sauda_sql = qry.SelectAllQry(saudaFields, sauda_tablename, WhereClouse, offset, limit, ' order by sauda_valid_from__c');
                              let sauda_res = await client.query(sauda_sql);
                              for (let j = 0; j < sauda_res.rows.length; j++) {
                                sauda_result.push(sauda_res.rows[j])
                                sauda_sfids.push(sauda_res.rows[j]['sfid'])
                              }
                              console.log('sauda_sql :::: >>>>>>', sauda_sql)
                              console.log('sauda_res :::: >>>>>>', sauda_res.rows)

                            } 
                            let saudaFields1 = ['*']
                            let sauda_tablename1 = SF_SAUDA_TABLE_NAME;
                            const sauda_status1 = ['Approved','OverDue'];
                            const WhereClouse1 = [];
                            WhereClouse1.push({ "fieldName": "distributor_name__c", "fieldValue": order_detail.rows[0]['sauda_party__c'] });
                            WhereClouse1.push({ "fieldName": "dealer__c", type: 'NULL'  });
                            WhereClouse1.push({ "fieldName": "sauda_status__c", "fieldValue": sauda_status1,type: 'IN' });
                            

                            let offset1 = '0', limit1 = '1000';
                            let sauda_sql1 = qry.SelectAllQry(saudaFields1, sauda_tablename1, WhereClouse1, offset1, limit1, ' order by sauda_valid_from__c');
                            let sauda_res1 = await client.query(sauda_sql1);
                            for (let j = 0; j < sauda_res1.rows.length; j++) {
                              sauda_result.push(sauda_res1.rows[j])
                              sauda_sfids.push(sauda_res1.rows[j]['sfid'])
                            }


                            // let final_queue = queue

                            // console.log('sauda_sql1 :::: >>>>>>', sauda_sql1)
                            console.log('sauda_sfid+++++++++++++++++ :::: >>>>>>', sauda_sfids)
                            
                            
                            
                            if (sauda_result.length > 0) {
                                console.log('sauda_result.rows :::: >>>>>>', sauda_result)
                                let qty_sauda = 0;
                                sauda_result.map((sauda) => {
                                    qty_sauda += sauda['balance_quantity__c'];
                                })
                                if (total_order_quantity > qty_sauda) {
                                    // total qty ordered is greater than sauda exists in the system
                                    // In this case either he will add new Sauda or update Sales Order quantity
                                    let subject = `Order Approval for Jaideep(Production)`
                                    let text = ` Order :  ` + order_id + '\n' + '\n' + `Error : ` + 'Sauda limit is less than order limit!' + '\n' + '\n' + `MESSAGE : ` + 'Sauda limit is less than order limit!' ;
                                    await email.email_error_log(subject, text);

                                    // Inspite of inserting data into RQM, put this response into RMQ__c table in response column.
                                    let rmq_sql = `update ${process.env.TABLE_SCHEMA_NAME}.rmq__c set response__c='${text}' where order_id__c='${order_id}';`;
                                    console.log('rmq_sql :::: >>>>>>', rmq_sql);
                                    let rmq_response = await client.query(rmq_sql);
                                    // Reset Msg in the queue
                                    // client_queue.post(queue['body'], function(error, body) {
                                    //   console.log('');
                                    //   console.log(error);
                                    //   queue = {};
                                    // });
                                } else {
                                    let pg_id__c_order = [];
                                    // If sauda qty is greater than order qty. Valid Case for Approval
                                    // remove existing order and order line data from the table and create new order and order line
                                    for (let i = 0; i < sauda_result.length; i++) {
                                        let sauda = sauda_result[i]
                                        let sauda_qty = sauda['balance_quantity__c'];
                                        let order_pg_id__c = uuidv4();
                                        pg_id__c_order.push(order_pg_id__c);
                                        let order = {
                                            'suada_rate__c': sauda['sauda_rate__c'],
                                            'order_status__c': status,
                                            'created_from__c': 'DMS',
                                            'pg_id__c': order_pg_id__c,
                                            'sauda_reference_no__c': sauda['sfid'],
                                            'order_date__c': order_detail.rows[0]['order_date__c'],
                                            'bill_to_party__c': order_detail.rows[0]['bill_to_party__c'],
                                            'lr_no__c': order_detail.rows[0]['lr_no'] || order_detail.rows[0]['lr_no__c'],
                                            'dealer__c': order_detail.rows[0]['dealer__c'],
                                            'driver_contact_no__c': order_detail.rows[0]['driver_contact'] || order_detail.rows[0]['driver_contact_no__c'],
                                            'remarks__c': order_detail.rows[0]['remarks__c'],
                                            'ship_to_address__c': order_detail.rows[0]['ship_to_address__c'],
                                            'town__c': order_detail.rows[0]['town__c'],
                                            'createddate': createddate,
                                            'last_modified_by_custom__c': createddate,
                                            'vehicle__c': order_detail.rows[0]['vehicle__c'],
                                            'sauda_party__c': order_detail.rows[0]['sauda_party__c'],
                                            'ship_to_party__c': order_detail.rows[0]['ship_to_party__c'],
                                            'dis_add_less1__c': order_detail.rows[0]['bill_rate__c'] - sauda['sauda_rate__c'],
                                            'total_quantity__c': '',
                                            'bill_rate__c': order_detail.rows[0]['bill_rate__c'],
                                            'brand__c': order_detail.rows[0]['brand__c'],
                                            'order_id_before_attaching_sauda__c': order_detail.rows[0]['name'],
                                            // 'brand__c': sauda['item__c'],
                                            // 'contract_type__c': order_detail.rows[0]['contract_type__c'],
                                            'created_from__c': order_detail.rows[0]['created_from__c'],
                                            // 'created_by_loggedin_user__c': order_detail.rows[0]['created_by_loggedin_user__c']

                                        };
                                        if (order_detail.rows[0]['sub_distributor__c']) {
                                            order['sub_distributor__c'] = order_detail.rows[0]['sub_distributor__c']
                                        }
                                        if (order_detail.rows[0]['team_id__c']) {
                                            order['team_id__c'] = order_detail.rows[0]['team_id__c']
                                        }
                                        let order_date = order_detail.rows[0]['order_date__c'];

                                        let order_line = []

                                        for (let j = 0; j < item_detail.rows.length; j++) {
                                            let item = item_detail.rows[j];
                                            if (total_order_quantity > sales_order_qty && sauda_qty > 0 && item['quantity__c'] > 0) {
                                                let line = {
                                                    "product_item__c": item['product_item__c'],
                                                    "pg_id__c": uuidv4(),
                                                    "size__c": item['size__c'],
                                                    "grade__c": item['grade__c'],
                                                    "uom__c": 'MT',
                                                    "order_pg_id__c": order_pg_id__c,
                                                    "quantity__c": 0,
                                                    "product_category__c": item['product_category__c'],
                                                    "createddate": createddate,
                                                    // "price__c": item['price__c'],
                                                    "price__c": sauda['sauda_rate__c'],
                                                    "length__c": item['length__c'],
                                                    // "brand__c": item['brand__c'],
                                                    "bent_stright__c": item['bent_stright__c'],

                                                };

                                                if ((sauda_qty - item['quantity__c']) > 0) {
                                                    // if sauda can handle this item
                                                    sales_order_qty += item['quantity__c'];
                                                    line['quantity__c'] = item['quantity__c']
                                                    sauda_qty = sauda_qty - item['quantity__c'];
                                                    item['quantity__c'] = 0;
                                                    order_line.push(line)
                                                } else {
                                                    // reduce quantity of item 
                                                    let quantity_sauda_can_consume = sauda_qty;
                                                    sales_order_qty += quantity_sauda_can_consume;
                                                    line['quantity__c'] = quantity_sauda_can_consume
                                                    item['quantity__c'] = item['quantity__c'] - quantity_sauda_can_consume;
                                                    sauda_qty = 0;
                                                    order_line.push(line)
                                                }
                                            }
                                        }
                                        //  Insert Order and Order line in DB and also trigger notification trigger on Mobile device
                                        
                                        if (order && order_line.length > 0) {
                                            order['total_quantity__c'] = order_line.reduce(function (acc, obj) { return acc + obj.quantity__c; }, 0).toFixed(2);
                                            // Inserting Order in DB
                                            const order_table_name = SF_CUSTOM_ORDER_TABLE_NAME;
                                            const order_fieldtobeinserted = Object.keys(order);
                                            const order_fieldValue = Object.values(order);
                                            let order_insert = await qry.insertRecord(order_fieldtobeinserted, order_fieldValue, order_table_name);

                                            // Inserting Order Line in DB 
                                            const order_line_table_name = SF_ORDER_LINE_TABLE_NAME;
                                            let order_line_fieldtobeinserted = `product_item__c, quantity__c, product_category__c, size__c, grade__c, price__c, length__c, bent_stright__c, uom__c, order_pg_id__c, pg_id__c, createddate`;
                                            let order_line_fieldValue = order_line.map(line => ({
                                                "product_item__c": line['product_item__c'],
                                                "quantity__c": line['quantity__c'].toFixed(2),
                                                "product_category__c": line['product_category__c'],
                                                "size__c": line['size__c'],
                                                "grade__c": line['grade__c'],
                                                "price__c": line['price__c'],
                                                "length__c": line['length__c'],
                                                "bent_stright__c": line['bent_stright__c'],
                                                "uom__c": 'MT',
                                                "order_pg_id__c": order_pg_id__c,
                                                "pg_id__c": uuidv4(),
                                                "createddate": createddate,
                                            })
                                            );
                                            let new_sauda_qty = 0;
                                            order_line.map((line) => {
                                                new_sauda_qty += line['quantity__c'];
                                            });

                                            let order_line_insert = await qry.insertManyRecord(order_line_fieldtobeinserted, order_line_fieldValue, order_line_table_name, ' pg_id__c');
                                            // This is for single sauda
                                            if (order_line_insert.success && order_insert.success) {

                                                // Sending Mail after approval
                                                let subject = `Order Approval for Jaideep(Production)`
                                                let text = ` Order :  ` + order_id + '\n' + '\n' + `Error : ` + '' + '\n' + '\n' + `MESSAGE : ` + `Sales Order Approved new Orders are -: ${pg_id__c_order}` ;
                                                await email.email_error_log(subject, text)

                                  
                                               
                                                task_done = true;
                                                
                                                let fields = ['*'],
                                                    tableName = SF_PUSH_NOTIFICATIONS_TABLE_NAME,
                                                    offset = '0',
                                                    limit = '1000',
                                                    WhereClouse = [];
                                                let user = [];
                                                if (order['sauda_party__c']) {
                                                    // let area_sql=`SELECT account.area__c as area__c FROM salesforce.team__c LEFT JOIN salesforce.account ON account.sfid=team__c.account__c where team__c.sfid='${order['sauda_party__c']}'`
                                                    let area_sql = `SELECT area__c FROM salesforce.account where sfid = '${order['sauda_party__c']}'`
                                                    let area_result = await client.query(area_sql);
                                                    let team_sql = `SELECT sfid FROM salesforce.team__c where account__c = '${order['sauda_party__c']}'`
                                                    let team_result = await client.query(team_sql);
                                                    console.log("area_sql>>>>>>>>>>>>>>>>", area_sql)

                                                    // console.log("item_res>>>>>>>>>>>>>>>>",items.rows[0].product_category__c)
                                                    let manager_sql = `SELECT team__c.sfid as sfid, team__c.manager_id__c as manager__c FROM salesforce.team_area__c LEFT JOIN salesforce.team__c ON team__c.sfid = team_area__c.team__c where team_area__c.area__c = '${area_result.rows[0]['area__c']}' and team_area__c.brand__c ='${item_detail.rows[0].product_category__c}'`;
                                                    let manger_result = await client.query(manager_sql);
                                                    console.log("manager_sql>>>>>>>>>>>>>>>>", manager_sql)

                                                    if (manger_result.rows.length > 0) {
                                                        user.push(manger_result.rows[0]['sfid'])
                                                        user.push(manger_result.rows[0]['manager__c'])
                                                    }
                                                    if (team_result.rows.length > 0) {
                                                        user.push(team_result.rows[0]['sfid'])
                                                    }
                                                }
                                                if (order['dealer__c']) {
                                                    let teamd_sql = `SELECT sfid FROM salesforce.team__c where account__c = '${order['dealer__c']}'`
                                                    let teamd_result = await client.query(teamd_sql);
                                                    if (teamd_result.rows.length > 0) {
                                                        user.push(teamd_result.rows[0]['sfid'])
                                                    }
                                                }
                                                if (order['sub_distributor__c']) {
                                                    let teams_sql = `SELECT sfid FROM salesforce.team__c where account__c = '${order['sub_distributor__c']}'`
                                                    let teams_result = await client.query(teams_sql);
                                                    if (teams_result.rows.length > 0) {
                                                        user.push(teams_result.rows[0]['sfid'])
                                                    }
                                                }
                                                console.log("user>>>>>>>>>>>>>", user)
                                                WhereClouse.push({ fieldName: 'user__c', fieldValue: user, type: 'IN' });
                                                let notification_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
                                                console.log("notification_sql>>>>>>>>>>>>>>>>", notification_sql)
                                                let notification_result = await client.query(notification_sql);
                                                let brand_sql = `SELECT name FROM salesforce.category_master__c where sfid = '${item_detail.rows[0].product_category__c}'`
                                                let brand_result = await client.query(brand_sql);
                                                console.log("brand_result>>>>>>>>>>>>>>>>", brand_result)
                                                if (notification_result.rowCount) {
                                                    const title = 'Order Approved!';
                                                    const body = `Sales Order for Brand: ${brand_result.rows[0]['name']} is ${order.order_status__c} and will be valid till ${order_date.toDateString()}`;
                                                    for (let j = 0; j < notification_result.rows.length; j++) {
                                                        sendnotificationToDevice(notification_result.rows[j], { title, body }, { title, brand_c: brand_result.rows[0]['name'], order_status__c: order.order_status__c, order_date__c: order_detail.rows[0]['order_date__c'] });
                                                    }
                                                }
                                                
                                                // Remove old Order and Order Line
                                                let delete_where_condition_order = [];
                                                let delete_where_condition_order_line = [];
                                                // condition for order and  order line
                                                if (order_detail.rows[0]['sfid']) {
                                                    delete_where_condition_order = [{ field: 'sfid', value: order_detail.rows[0]['sfid'] }];
                                                    delete_where_condition_order_line = [{ field: 'order__c', value: order_detail.rows[0]['sfid'] }];
                                                } else {
                                                    delete_where_condition_order = [{ field: 'pg_id__c', value: order_detail.rows[0]['pg_id__c'] }];
                                                    delete_where_condition_order_line = [{ field: 'order_pg_id__c', value: order_detail.rows[0]['pg_id__c'] }];
                                                }
                                                console.log('Deleting ORder and Order line from the DB ::::')
                                                await qry.deleteRecord(SF_CUSTOM_ORDER_TABLE_NAME, delete_where_condition_order);
                                                await qry.deleteRecord(SF_ORDER_LINE_TABLE_NAME, delete_where_condition_order_line);
                                                // Update Sauda Qty in DB
                                                console.log('Updating Sauda in DB ::::')
                                                let get_sauda_sql=`select balance_quantity__c from salesforce.sauda__c where sfid='${sauda['sfid']}'`
                                                let get_sauda_res=await client.query(get_sauda_sql)
                                                if(get_sauda_res.rows.length>0){
                                                  let rightnow_qty=get_sauda_res.rows[0].balance_quantity__c
                                                  let rawData=`sauda:${sauda['sfid']} --------> rightnow_qty:${rightnow_qty} , new_sauda_qty:${new_sauda_qty}`            
                                                  await print(rawData)
                                                }
                                                  let update_sql = `update salesforce.sauda__c set balance_quantity__c=balance_quantity__c -${new_sauda_qty},total_so_qty__c=total_so_qty__c +${new_sauda_qty}  where sfid='${sauda['sfid']}'`;
                                                  let update_result = await client.query(update_sql);  
                                                
                                                // Set is_so_blocked and is_updated_blocked to false before the insertion of order line
                                                // let update_to = `update salesforce.sauda__c set is_so_blocked__c='false' where sfid IN ('${(sauda_sfids).join("','")}')`;
                                                // let update_to_res = await client.query(update_to);
                                                // console.log("update_is_blocked",update_to)
                                                console.log('checking for insert update_sql ::::: >>>>>>>', update_sql);
                                                console.log('checking for insert Order ::::: >>>>>>>', order_insert);
                                                console.log('checking for insert Order line ::::: >>>>>>>', order_line_insert);
                                                order['order_line'] = [];
                                                order['order_line'].push(...order_line);
                                                sales_order.push(order);
                                                console.log("vvvvvvvvvvvvvvvvvvvvvvv", sales_order);
                                                
                                            } else {
                                                // Sending Mail after approval

                                                let subject = `Order Approval for Jaideep(Production)`
                                                let text = `Status: ${status} and Order :  ` + order_id + '\n' + '\n' + `Error : ` + 'Internal Server Failed while Order in Approval' + '\n' + '\n' + `MESSAGE : ` + `Sales Order Approval failed due to Order and Order Line creation` ;
                                                await email.email_error_log(subject, text);
                                                task_done = true;

                                                // // Reset Msg in the queue
                                                // if(queue && queue['body']){
                                                //   client_queue.post(queue['body'], function(error, body) {
                                                //     console.log('');
                                                //     console.log(error);
                                                //     queue = {};
                                                //   });
                                                // }

                                                // Sending Error notification to User
                                                // const title = 'Order Failed!';
                                                // const body = `Sales Order for Brand: ${brand_result.rows[0]['name']} is ${order.order_status__c} and will be valid till ${order_date.toDateString()}`;
                                                // sendnotificationToDevice(notification_result.rows[j], { title, body }, { title, brand_c: brand_result.rows[0]['name'], order_status__c: order.order_status__c, order_date__c: order_detail.rows[0]['order_date__c'] });
                                            }     
                                        }else {
                                          let subject = `Order Approval for Jaideep(Production)`
                                          let text = `Status: ${status} and Order :  ` + order_id + '\n' + '\n' + `Error : ` + 'Failed while createing order and orderline in code only' + '\n' + '\n' + `MESSAGE : ` + `Sales Order failed` ;
                                          await email.email_error_log(subject, text);
                                          task_done = false;
                                          /**
                                           * @TODO Ajay, we have to build some logic for this. So that this case is handled properly.
                                           * Here order and order lines are not created and order sfid and status wont be avaiable in RMQ but can be seen in rmq__c table.
                                           */

                                          // Reset Msg in the queue
                                          // if(queue && queue['body']){
                                          //   client_queue.post(queue['body'], function(error, body) {
                                          //     console.log('');
                                          //     console.log(error);
                                          //     queue = {};
                                          //   });
                                          // }
                                        }
                                    }

                                    // If sales order approval done
                                    if(!task_done){
                                      // Reset Msg in the queue
                                      if(queue && queue['body']){
                                        client_queue.post(queue['body'], function(error, body) {
                                          console.log('');
                                          console.log(error);
                                          queue = {};
                                        });
                                      }
                                    }
                                    for (let a = 0; a < sales_order.length; a++) {
                                        console.log('sales_order :::: >>>>', sales_order[a])
                                    }
                                    let subject = `Order Approval for Jaideep(Production)`
                                    let text = ` Order :  ` + order_id + '\n' + '\n' + `Error : ` + '' + '\n' + '\n' + `MESSAGE : ` + `Sales Order Approved new Orders are -: ${pg_id__c_order}` ;
                                    await email.email_error_log(subject, text)
                                    // @TODO Harshit, update user for sales order success and email as well.
                                    // response.response = { 'success': true, 'order': sales_order, "message": "Order Created Successfully" };
                                    // response.status = 200;
                                    // return response;
                                }
                            } else {
                              // @TODO, remove this condition.
                                let subject = `Order Approval for Jaideep(Production)`
                                let text = ` Order :  ` + order_id + '\n' + '\n' + `Error : ` + 'No Sauda Exists for this Distributor' + '\n' + '\n' + `MESSAGE : ` + `Sales Order Approval failed for Distributor ` ;
                                await email.email_error_log(subject, text);
                                // Reset Msg in the queue
                                // if(queue && queue['body']){
                                //   client_queue.post(queue['body'], function(error, body) {
                                //     console.log('');
                                //     console.log(error);
                                //     queue = {};
                                //   });
                                // }
                            }
                        } else {
                          let subject = `Order Approval for Jaideep(Production)`
                          let text = ` Order :  ` + order_id + '\n' + '\n' + `Error : ` + 'No Order Line Exists for this Sales Order' + '\n' + '\n' + `MESSAGE : ` + `Sales Order Approval failed for Distributor : ${order_detail.rows[0]['sauda_party__c']}` ;
                          await email.email_error_log(subject, text);
                          // Reset Msg in the queue
                          // if(queue && queue['body']){
                          //   client_queue.post(queue['body'], function(error, body) {
                          //     console.log('');
                          //     console.log(error);
                          //     queue = {};
                          //   });
                          // }
                        }
                    } else {
                      let subject = `Order Approval for Jaideep(Production)`
                      let text = ` Order :  ` + order_id + '\n' + '\n' + `Error : ` + 'No Sales Order Exists for this Distributor' + '\n' + '\n' + `MESSAGE : ` + `Sales Order Approval failed for Distributor ` ;
                      await email.email_error_log(subject, text);
                      // Reset Msg in the queue
                      // if(queue && queue['body']){
                      //   client_queue.post(queue['body'], function(error, body) {
                      //     console.log('');
                      //     console.log(error);
                      //     queue = {};
                      //   });
                      // }
                    }
                }
            }else {
              console.log('Queue is empty in RMQ')
              // let subject = `Order Approval for Jaideep(Prxoduction)`
              // let text = ` Error : Queue is empty `;
              // await email.email_error_log(subject, text);
              // if(queue && queue['body']){
              //   client_queue.post(queue['body'], function(error, body) {
              //     console.log('');
              //     console.log(error);
              //     queue = {};
              //   });
              // }
            }
        // }else {
        //   let subject = `Order Approval for Jaideep(Sandbox)`
        //   let text = ` Error : Error in fetching msg from Queue `;
        //   await email.email_error_log(subject, text);
        //   if(queue && queue['body']){
        //     client_queue.post(queue['body'], function(error, body) {
        //       console.log('');
        //       console.log(error);
        //       queue = {};
        //     });
        //   }
        // }
    // });
    } catch (err) {
      // @TODO, Harshit error in cron please initiate error email and notify user for the same.
      let subject = `Order Approval for Jaideep(Production)- Exception`
      let text = ` Error : ${err} ` + '\n' + `Order ID- ${JSON.stringify(queue)}`;
      await email.email_error_log(subject, text)
      console.log('Error in cronjob:', err);
      if(queue && queue['body']){
        client_queue.post(queue['body'], function(error, body) {
          console.log('');
          console.log(error);
          queue = {};
        });
      }
      
    }
  },
  { scheduled: true }
);


const saudaCron=cron.schedule('1 * * * *',async ()=>{
  try {
    let todayDate=dtUtil.todayDate();
        let currentHour=Number(new Date().getHours())-1;
        let myFileName=`${todayDate}_${currentHour}`
        const FileDirectoryPath = path.join(__dirname, `../temp/logs/${myFileName}.txt`)
        console.log("FileDirectoryPath",FileDirectoryPath)
        if(fs.existsSync(FileDirectoryPath)){
          await email.sendSaudaMail(`${myFileName}.txt`)
        }else{
          console.log("file dosen't exist")
        }
        
  } catch (error) {
    console.log("eroor",error)
  }
},
  { scheduled: true }
)
const deletCron=cron.schedule('50 23 * * *',async ()=>{
  try {
        fs.readdir(path.join(__dirname, `../temp/logs`),(err,files)=>{
          if(err){
            throw err
          }else{
            for (let i = 0; i < files.length; i++) {
              const file = files[i];
              if(file=='.gitkeep'){

              }else{
                fs.unlink(path.join(__dirname, `../temp/logs/${file}`),(err)=>{
                  if(err) throw err
                })
              }
            }
          }
        })
          } catch (error) {
    console.log("eroor",error)
  }
},
  { scheduled: true }
)

module.exports = {
  approvalSOCron,saudaCron,deletCron};
