const qry = require(`${PROJECT_DIR}/utility/selectQueries`);
const { sendNotificationToMultipleDevices, sendnotificationToDevice } = require(`${PROJECT_DIR}/utility/notifications`);
const dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
const validation = require(`${PROJECT_DIR}/utility/validation`);
let response = { "status": 200, "response": "" };

module.exports = { getUsersNotifications, newLeadCreated, newAccountCreated, newSudaRateCreated, newDisDealerMappingCreated, salesOrderStatusUpdate, newEventCreated, newSchemeLaunched};

async function getUsersNotifications(req) {
  try {
    let validationError = [];
    validation.issetNotEmpty(req.query.user_sfid) ? true : validationError.push({ field: 'user__c', message: 'Mandatory parameter.' });

    if (validationError.length == 0) {
      let fields = ['*'];
      const tableName = SF_NOTIFICATIONS_TABLE_NAME;
      const WhereClouse = [];
      let offset = '0',
        limit = '1000';
      WhereClouse.push({ fieldName: 'user__c', fieldValue: req.query.user_sfid });
      let notification_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
      let notifications = await client.query(notification_sql);
      if (notifications.rowCount) {
        response.response = { success: true, count: notifications.rowCount, notifications: notifications.rows };
        response.status = 200;
        return response;
      } else {
        response.response = { success: false, message: 'No record found.' };
        response.status = 200;
        return response;
      }
    } else {
      response.response = { success: false, message: 'Mandatory parameter(s) are missing.', error : validationError };
      response.status = 400;
      return response;
    }
  } catch (e) {
    console.log("Error :::::>>>>>>> 048 :::::::", e);
    response.response = { 'success': false, "data": [], "message": "Internal server error." };
    response.status = 500;
    return response;
  }
}

async function sendNotification(dbData, notification, data) {
  let team_c = [];
  for (const key in dbData) {
    console.log('dbData[key]', dbData[key]);
    if (dbData[key] && key.includes('_sfid')) {
      team_c.push(dbData[key]);
    }
  }

  if (team_c.length) {
    let fields = ['firebase_token__c'],
      tableName = SF_PUSH_NOTIFICATIONS_TABLE_NAME,
      offset = '0',
      limit = '1000',
      WhereClouse = [];
    WhereClouse.push({ fieldName: 'user__c', fieldValue: team_c, type: 'IN' });
    let notification_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
    let notification_result = await client.query(notification_sql);
    if (notification_result.rowCount) {
      sendNotificationToMultipleDevices(
        notification_result.rows.map((ele) => ele.firebase_token__c),
        notification,
        data
      );
    }
  }
}

async function newLeadCreated(sfid) {
  let fields = ['lead__c.customer_nametext__c, tc_1.sfid as tc_1_sfid, tc_2.sfid as tc_2_sfid'],
    tablename = 'lead__c',
    wehereClouse = [];
  wehereClouse.push({ fieldName: 'lead__c.sfid', fieldValue: sfid });
  let joins = [
    {
      type: 'LEFT',
      table_name: 'team_area__c as tac_1',
      p_table_field: `lead__c.town__c`,
      s_table_field: `tac_1.area__c`,
    },
    {
      type: 'LEFT',
      table_name: 'team_area__c as tac_2',
      p_table_field: `tac_1.brand__c`,
      s_table_field: `tac_2.brand__c`,
    },
    {
      type: 'LEFT',
      table_name: 'team__c as tc_1',
      p_table_field: `tac_2.team__c`,
      s_table_field: `tc_1.sfid`,
    },
    {
      type: 'LEFT',
      table_name: 'team__c as tc_2',
      p_table_field: `tc_1.manager_id__c`,
      s_table_field: `tc_2.sfid`,
    },
  ];
  let lead_sql = qry.fetchAllWithJoinQry(fields, tablename, joins, wehereClouse, '0', '1', ' order by lead__c.createddate desc');
  let lead_data = await client.query(lead_sql);  
  if (lead_data.rowCount) {
    const title = 'New lead created!',
    body = `A new lead called ${lead_data.rows[0].customer_nametext__c} created.`;
    sendNotification(lead_data.rows[0],{ title, body },{ title, lead_sfid: sfid });   
  }

}

async function newAccountCreated(sfid, acc_type) {
  let fields = ['account.name, account.area__c, account_brand_mapping__c.brand__c, tc_1.sfid as tc_1_sfid, tc_2.sfid as tc_2_sfid'],
    tablename = 'account',
    wehereClouse = [];
  wehereClouse.push({ fieldName: 'account.sfid', fieldValue: sfid });
  wehereClouse.push({ fieldName: 'account.account_type__c', fieldValue: acc_type });
  if (acc_type === 'Influencer') {
    wehereClouse.push({ fieldName: 'account.active__c', fieldValue: 'Yes' });
  }
  let joins = [
    {
      type: 'LEFT',
      table_name: 'account_brand_mapping__c',
      p_table_field: `account.sfid`,
      s_table_field: `account_brand_mapping__c.account__c`,
    },
    {
      type: 'LEFT',
      table_name: 'team_area__c as tac_1',
      p_table_field: `account.area__c`,
      s_table_field: `tac_1.area__c`,
    },
    {
      type: 'LEFT',
      table_name: 'team_area__c as tac_2',
      p_table_field: `account_brand_mapping__c.brand__c`,
      s_table_field: `tac_2.brand__c`,
    },
    {
      type: 'LEFT',
      table_name: 'team__c as tc_1',
      p_table_field: `tac_2.team__c`,
      s_table_field: `tc_1.sfid`,
    },
    {
      type: 'LEFT',
      table_name: 'team__c as tc_2',
      p_table_field: `tc_1.manager_id__c`,
      s_table_field: `tc_2.sfid`,
    },
  ];
  let acc_sql = qry.fetchAllWithJoinQry(fields, tablename, joins, wehereClouse, '0', '1', ' order by account.createddate desc');
  let acc_data = await client.query(acc_sql);
  if (acc_data.rowCount) {
    const title = `New ${acc_type} created!`,
      body = `A new ${acc_type} called ${acc_data.rows[0].name} created.`;
    sendNotification(acc_data.rows[0], { title, body }, { title, lead_sfid: sfid });
  }

}

async function newSudaRateCreated(sfid) {
  const suda_price = await qry.getThroughSfid(SF_SAUDA_PRICE_LIST_TABLE_NAME, sfid);
  let { account__c, active__c, value__c, maximum_quantity_limit__c, effective_from__c, effective_to__c } = suda_price;
  if (account__c && active__c) {
    let team_sql = await qry.SelectAllQry(['*'], SF_TEAM_TABLE_NAME, [{ fieldName: 'account__c', fieldValue: account__c }]);
    let team_result = await client.query(team_sql);
    if (team_result.rowCount) {
      let fields = ['*'],
        tableName = SF_PUSH_NOTIFICATIONS_TABLE_NAME,
        offset = '0',
        limit = '1000',
        WhereClouse = [];
      WhereClouse.push({ fieldName: 'user__c', fieldValue: team_result.rows[0].sfid });
      let notification_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
      let notification_result = await client.query(notification_sql);
      if (notification_result.rowCount) {
        effective_from__c = dtUtil.timestampToDate(effective_from__c.getTime(), 'YYYY-MM-DD');
        effective_to__c = dtUtil.timestampToDate(effective_to__c.getTime(), 'YYYY-MM-DD');
        const title = 'Sauda price list added!';
        const body = `Today's sauda rate is ${value__c} and the maximum sauda quantity limit is ${maximum_quantity_limit__c} updated On ${effective_from__c} and valid upto ${effective_to__c}`;
        sendnotificationToDevice(notification_result.rows[0], { title, body }, { title, value__c:`${value__c}`, maximum_quantity_limit__c:`${maximum_quantity_limit__c}`, effective_from__c, effective_to__c });
      }
    }
  }
}

async function newDisDealerMappingCreated(sfid) {
  const dis_dealer_mapping = await qry.getThroughSfid(SF_DIS_DEALER_MAPPING_TABLE_NAME, sfid);
  if (dis_dealer_mapping) {
    let { ship_to_party__c, sold_to_party__c } = dis_dealer_mapping;
    for (const acc in { ship_to_party__c, sold_to_party__c }) {
      let fields = ['account.name, account.account_type__c, team__c.sfid as team_sfid'];
      let tableName = 'account';
      let offset = '0',
        limit = '1';
      let WhereClouse = [];

      let joins = [
        {
          type: 'LEFT',
          table_name: 'team__c',
          p_table_field: `account.sfid`,
          s_table_field: `team__c.account__c`,
        },
      ];

      WhereClouse.push({ fieldName: 'account.sfid', fieldValue: dis_dealer_mapping[acc] });

      let acc_sql = qry.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit);

      let acc_result = await client.query(acc_sql);
      if (acc_result.rowCount) {
        dis_dealer_mapping[acc] = acc_result.rows[0];
      }
    }

    for (const dis_dealer in { ship_to_party__c, sold_to_party__c }) {
      if (dis_dealer_mapping[dis_dealer]['team_sfid']) {
        let fields = ['*'],
          tableName = SF_PUSH_NOTIFICATIONS_TABLE_NAME,
          offset = '0',
          limit = '1',
          WhereClouse = [];
        WhereClouse.push({ fieldName: 'user__c', fieldValue: dis_dealer_mapping[dis_dealer]['team_sfid'] });
        let notification_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
        let notification_result = await client.query(notification_sql);
        if (notification_result.rowCount) {
          const { account_type__c, name } = dis_dealer_mapping[dis_dealer === 'ship_to_party__c' ? 'sold_to_party__c' : dis_dealer === 'sold_to_party__c' ? 'ship_to_party__c':''];
          if(account_type__c && name){
              const title = 'You are mapped!';
              const body = `Yay! You are mapped with a '${account_type__c}' called '${name}'!`;
              sendnotificationToDevice(notification_result.rows[0], { title, body }, { title, account_type__c, name });

          }
        }
      }
    }
  }
}

async function salesOrderStatusUpdate(sfid) {
  const JoinsWhereClouse = [];

  JoinsWhereClouse.push({ fieldName: 'custom_order__c.sfid', fieldValue: sfid });

  let fields = ['custom_order__c.name, custom_order__c.dealer__c, custom_order__c.sauda_party__c, custom_order__c.sub_distributor__c, custom_order__c.order_date__c, custom_order__c.order_status__c, category_master__c.name as brand_name'];

  let joins = [
    {
      type: 'LEFT',
      table_name: 'category_master__c',
      p_table_field: `custom_order__c.brand__c`,
      s_table_field: `category_master__c.sfid`,
    },
  ];
  let sales_order_sql = qry.fetchAllWithJoinQry(fields, 'custom_order__c', joins, JoinsWhereClouse, '0', '1', ' order by custom_order__c.createddate desc');
  let sales_order = await client.query(sales_order_sql);
  if (sales_order.rowCount) {
    let { name, dealer__c, sauda_party__c, sub_distributor__c, brand_name, order_date__c, order_status__c } = sales_order.rows[0];
    let team_sql = `select sfid from salesforce.team__c where account__c IN ('${sales_order.rows[0].dealer__c}','${sales_order.rows[0].sauda_party__c}','${sales_order.rows[0].sub_distributor__c}')`
    let team_result = await client.query(team_sql);
    let result_arr = [];
    if(team_result.rows.length>0){
      team_result.rows.map((data)=>{
        result_arr.push(data['sfid'])
      }
      )
    }
    order_date__c = dtUtil.timestampToDate(order_date__c.getTime(), 'YYYY-MM-DD');
    let fields = ['*'],
      tableName = SF_PUSH_NOTIFICATIONS_TABLE_NAME,
      offset = '0',
      limit = '1000',
      WhereClouse = [];
    WhereClouse.push({ fieldName: 'user__c', fieldValue: result_arr, type: 'IN' });
    let notification_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, ' order by createddate desc');
    let notification_result = await client.query(notification_sql);
    console.log(".....................",notification_sql)
    if (notification_result.rowCount) {
      for (let i = 0; i < notification_result.rows.length; i++) {        
        const title = `Order ${order_status__c}!`;
        const body = `Order ${name} for ${brand_name} is ${order_status__c} which was booked on ${order_date__c}.`;
        sendnotificationToDevice(notification_result.rows[i], { title, body }, { title, brand_name, order_status__c, order_date__c });
      }
    }
  }
}

async function newEventCreated(sfid) {
  const event = await qry.getThroughSfid(SF_EVENTS_TABLE_NAME, sfid);
  if (event && ['Distributor', 'Dealer', 'Sub Distributor'].includes(event.target_audience__c)) {
    const { name, remarks__c, url__c, brand__c, area__c, target_audience__c } = event;
    let tablename = SF_TEAM_TABLE_NAME,
      offset = '0',
      limit = '1000',
      JoinsWhereClouse = [],
      fields = ['push_notifications__c.firebase_token__c'],
      joins = [
        {
          type: 'LEFT',
          table_name: 'account',
          p_table_field: `team__c.account__c`,
          s_table_field: `account.sfid`,
        },
        {
          type: 'LEFT',
          table_name: 'account_brand_mapping__c',
          p_table_field: `account.sfid`,
          s_table_field: `account_brand_mapping__c.account__c`,
        },
        {
          type: 'LEFT',
          table_name: 'push_notifications__c',
          p_table_field: `team__c.sfid`,
          s_table_field: `push_notifications__c.user__c`,
        },
      ];
    JoinsWhereClouse.push({ fieldName: 'account_brand_mapping__c.brand__c', fieldValue: brand__c });
    JoinsWhereClouse.push({ fieldName: 'account.area__c', fieldValue: area__c });
    JoinsWhereClouse.push({ fieldName: 'account.account_type__c', fieldValue: target_audience__c });
    let team_sql = qry.fetchAllWithJoinQry(fields, tablename, joins, JoinsWhereClouse, offset, limit);
    let teams = await client.query(team_sql);
    if (teams.rowCount) {
      const title = 'New event created!',
        body = `A new event called '${name}' created. ${remarks__c}`;
      sendNotificationToMultipleDevices(
        teams.rows.map((ele) => ele.firebase_token__c),
        { title, body },
        { title, name, remarks__c, url__c }
      );
    }
  }
}

async function newSchemeLaunched(sfid) {
  let tablename = SF_TEAM_TABLE_NAME,
    offset = '0',
    limit = '1',
    JoinsWhereClouse = [],
    fields = ['push_notifications__c.user__c, push_notifications__c.firebase_token__c, scheme_definition__c.scheme_name__c, scheme_definition__c.description__c'],
    joins = [
      {
        type: 'LEFT',
        table_name: 'push_notifications__c',
        p_table_field: `team__c.sfid`,
        s_table_field: `push_notifications__c.user__c`,
      },
      {
        type: 'LEFT',
        table_name: 'scheme_accumulation__c',
        p_table_field: `team__c.account__c`,
        s_table_field: `scheme_accumulation__c.account_id__c`,
      },
      {
        type: 'LEFT',
        table_name: 'scheme_definition__c',
        p_table_field: `scheme_accumulation__c.scheme_id__c`,
        s_table_field: `scheme_definition__c.sfid`,
      },
    ];
  JoinsWhereClouse.push({ fieldName: 'scheme_accumulation__c.sfid', fieldValue: sfid });

  let team_sql = qry.fetchAllWithJoinQry(fields, tablename, joins, JoinsWhereClouse, offset, limit);
  let teams = await client.query(team_sql);
  if (teams.rowCount) {
    const { user__c, firebase_token__c, scheme_name__c, description__c } = teams.rows[0];
    const title = 'New scheme launched!',
      body = `A new scheme '${scheme_name__c}' has been launched for you!`;
    sendnotificationToDevice({user__c, firebase_token__c}, { title, body }, { title, scheme_name__c, description__c });
  }
}