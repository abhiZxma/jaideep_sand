const cron = require('node-cron');
const qry = require(`${PROJECT_DIR}/utility/selectQueries`);
const dtUtil = require(`${PROJECT_DIR}/utility/dateUtility`);
const { sendnotificationToDevice } = require(`${PROJECT_DIR}/utility/notifications`);

const minute = 0;
const hour = 9;

const cronjob = cron.schedule(
  `${minute} ${hour} * * *`,
  async () => {
    try {
      console.log('Cron job started');
      let fields = ['account.*, team__c.sfid as team_sfid'];
      const tableName = SF_ACCOUNT_TABLE_NAME;
      const WhereClouse = [];
      let offset = '0',
        limit = '1000';
      let joins = [
        {
          type: 'LEFT',
          table_name: 'team__c',
          p_table_field: `account.sfid`,
          s_table_field: `team__c.account__c`,
        },
      ];
      WhereClouse.push({ fieldName: 'account.date_of_birth__c', fieldValue: dtUtil.timestampToDate(Date.now(), 'YYYY-MM-DD') });
      let birthday_account_sql = qry.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, ' order by account.createddate desc');
      let birthday_acounts = await client.query(birthday_account_sql);
      if (birthday_acounts.rowCount) {
        for (let i = 0; i < birthday_acounts.rows.length; i++) {
          if (birthday_acounts.rows[i].team_sfid) {
            let fields = ['*'],
              WhereClouse = [],
              offset = '0',
              limit = '1';
            WhereClouse.push({ fieldName: 'user__c', fieldValue: birthday_acounts.rows[i].team_sfid });
            let push_notification_sql = qry.SelectAllQry(fields, SF_PUSH_NOTIFICATIONS_TABLE_NAME, WhereClouse, offset, limit, ' order by createddate desc');
            let pushNotifications = await client.query(push_notification_sql);
            if (pushNotifications.rowCount && pushNotifications.rows[0].firebase_token__c) {
              const title = 'Customer birthday wishes!';
              const body = `Customer (${birthday_acounts.rows[i].sfid}) has his birthday today. wish him a very happy birthday.`;
              sendnotificationToDevice(pushNotifications.rows[0], { title, body }, { title, name: birthday_acounts.rows[i].name, sap_account: birthday_acounts.rows[i].sap_account__c, date: `${birthday_acounts.rows[i].date_of_birth__c}` });
            }
          }
        }
      }
      WhereClouse.length = 0;
      WhereClouse.push({ fieldName: 'account.anniversary_date__c', fieldValue: dtUtil.timestampToDate(Date.now(), 'YYYY-MM-DD') });
      let anniversary_account_sql = qry.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit, ' order by account.createddate desc');
      let anniversary_acounts = await client.query(anniversary_account_sql);
      if (anniversary_acounts.rowCount) {
        for (let i = 0; i < anniversary_acounts.rows.length; i++) {
          if (anniversary_acounts.rows[i].team_sfid) {
            let fields = ['*'],
              WhereClouse = [],
              offset = '0',
              limit = '1';
            WhereClouse.push({ fieldName: 'user__c', fieldValue: anniversary_acounts.rows[i].team_sfid });
            let push_notification_sql = qry.SelectAllQry(fields, SF_PUSH_NOTIFICATIONS_TABLE_NAME, WhereClouse, offset, limit, ' order by createddate desc');
            let pushNotifications = await client.query(push_notification_sql);
            if (pushNotifications.rowCount && pushNotifications.rows[0].firebase_token__c) {
              const title = 'Customer anniversary wishes!';
              const body = `Customer (${anniversary_acounts.rows[i].sfid}) has his anniversary today. wish him a very happy anniversary.`;
              sendnotificationToDevice(pushNotifications.rows[0], { title, body }, { title, name: anniversary_acounts.rows[i].name, sap_account: anniversary_acounts.rows[i].sap_account__c, date: `${anniversary_acounts.rows[i].anniversary_date__c}` });
            }
          }
        }
      }
    } catch (err) {
      console.log('Error in cronjob:', err);
    }
  },
  { scheduled: true }
);

// const minute2 = 0;
// const hour2 = 6;

// const cronjob2 = cron.schedule(
//   `${minute2} ${hour2} * * *`,
//   async () => {
//     try {
//       console.log('Cron job 2 started for Credit Limit low and sauda limit Low');
//       let fields = ['account.sfid, account.balance_credit_limit__c, account.total_credit_limit__c, team__c.sfid as team_sfid'];
//       const tableName = SF_ACCOUNT_TABLE_NAME;
//       const WhereClouse = [];
//       let offset = '0',
//         limit = '1000';
//       let joins = [
//         {
//           type: 'LEFT',
//           table_name: 'team__c',
//           p_table_field: `account.sfid`,
//           s_table_field: `team__c.account__c`,
//         },
//       ];
//       WhereClouse.push({ fieldName: 'account.sfid', type: 'NOTNULL' });
//       WhereClouse.push({ fieldName: 'team__c.sfid', type: 'NOTNULL' });
//       WhereClouse.push({ fieldName: 'account.balance_credit_limit__c', type: 'NOTNULL' });
//       WhereClouse.push({ fieldName: 'account.total_credit_limit__c', type: 'NOTNULL' });
//       WhereClouse.push({ fieldName: 'account.account_type__c', fieldValue: ['Dealer', 'Distributor'], type: 'IN' });
//       let acc_sql = qry.fetchAllWithJoinQry(fields, tableName, joins, WhereClouse, offset, limit);
//       let accounts = await client.query(acc_sql);
//       if (accounts.rowCount) {
//         for (let i = 0; i < accounts.rows.length; i++) {
//           const { balance_credit_limit__c, total_credit_limit__c, team_sfid } = accounts.rows[i];
//           /**
//            * Logic - Balance_Credit_Limit__c < 20% of Total_Credit_Limit__c
//            */
//           if (balance_credit_limit__c < total_credit_limit__c * 0.2) {
//             let fields = ['*'],
//               WhereClouse = [],
//               offset = '0',
//               limit = '1';
//             WhereClouse.push({ fieldName: 'user__c', fieldValue: team_sfid });
//             let push_notification_sql = qry.SelectAllQry(fields, SF_PUSH_NOTIFICATIONS_TABLE_NAME, WhereClouse, offset, limit, ' order by createddate desc');
//             let pushNotifications = await client.query(push_notification_sql);
//             if (pushNotifications.rowCount && pushNotifications.rows[0].firebase_token__c) {
//               const title = 'Credit limit is low!';
//               const body = 'Your current credit limit is low. kindly make payment.';
//               sendnotificationToDevice(pushNotifications.rows[0], { title, body }, { title });
//             }
//           }
//         }
//       }
//       /**
//        * Distributor Low Sauda Push Notification
//        * Notification should be appeared only when the sum of Balance_Quantity__c < 5
//        */
//       let dis_sql = `select t.sfid as team_sfid, SUM(s.balance_quantity__c) from salesforce.sauda__c as s left join salesforce.account as a on a.sfid = s.distributor_name__c left join salesforce.team__c as t on t.account__c = a.sfid where a.account_type__c = 'Distributor' and t.sfid is not null group by team_sfid having SUM(s.balance_quantity__c) < 5000`;
//       let dis_result = await client.query(dis_sql);
//       if (dis_result.rowCount) {
//         for (let i = 0; i < dis_result.rows.length; i++) {
//           const { team_sfid } = dis_result.rows[i];
//           let fields = ['*'],
//             WhereClouse = [],
//             offset = '0',
//             limit = '1';
//           WhereClouse.push({ fieldName: 'user__c', fieldValue: team_sfid });
//           let push_notification_sql = qry.SelectAllQry(fields, SF_PUSH_NOTIFICATIONS_TABLE_NAME, WhereClouse, offset, limit, ' order by createddate desc');
//           let pushNotifications = await client.query(push_notification_sql);
//           if (pushNotifications.rowCount && pushNotifications.rows[0].firebase_token__c) {
//             const title = 'Sauda limit is low!';
//             const body = 'Book new Sauda until it gets Over!!';
//             sendnotificationToDevice(pushNotifications.rows[0], { title, body }, { title });
//           }
//         }
//       }
//     } catch (err) {
//       console.log('Error in cronjob:', err);
//     }
//   },
//   { scheduled: true }
// );

const minute3 = 0;
const hour3 = 1;

const sauda_overdue = cron.schedule(
  `${minute3} ${hour3} * * *`,
  async () => {
    try {
      console.log('Cron sauda_overdue started');
      const tableName = SF_SAUDA_TABLE_NAME;
      const WhereClouse = [];
      let fieldValue = [];

      let effective_to__c1 = dtUtil.todayDatetime();
      console.log("effective_to__c1>>>>>>>>>>>>>>>>>>",effective_to__c1)
      WhereClouse.push({ field: 'active__c', value: 'true' });
      WhereClouse.push({ field: 'sauda_valid_to__c', value: effective_to__c1 ,type : "LT"});
      WhereClouse.push({ field: 'balance_quantity__c', value: "0" ,type : "GT"});
      WhereClouse.push({ field: 'sauda_status__c', value: "Approved" });
      fieldValue.push({ field: 'sauda_status__c', value: "OverDue" });   

      let update_sql = await qry.updateRecord( tableName,fieldValue, WhereClouse );
      console.log(update_sql)

    } catch (err) {
      console.log('Error in cronjob:', err);
    }
  },
  { scheduled: true }
);

const minute4 = 0;
const hour4 = 1;

const update_overdue = cron.schedule(
  `${minute4} ${hour4} 1 * *`,
  async () => {
    try {
      let fields = ['sum(sauda__c.balance_quantity__c),sauda__c.distributor_name__c'];
      const tableName = 'sauda__c';
      const sauda_status = ['Approved', 'OverDue'];
      let effective_to__c1 = dtUtil.todayDate();
      let WhereClouse = [];
      WhereClouse.push({ fieldName: 'active__c', fieldValue: 'true' });
      WhereClouse.push({ fieldName: 'sauda_document_date__c', fieldValue: effective_to__c1, type: "LT" });
      WhereClouse.push({ fieldName: 'sauda_status__c', fieldValue: sauda_status, type: 'IN' });
      let offset = '0', limit = '1000';
      let br_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, 'group by distributor_name__c');

      console.log("sql >>>>>>>>", br_sql);
      let br_result = await client.query(br_sql);
      if (br_result.rows.length > 0) {
        for (let i = 0; i < br_result.rows.length; i++) {

          let update_sql = `update salesforce.account set overdue_sauda_qty_month__c=${br_result.rows[i]['sum']}  where sfid='${br_result.rows[i]['distributor_name__c']}'`;
          let update_result = await client.query(update_sql);
          // console.log('checking for insert update_sql ::::: >>>>>>>', update_sql);
        }
      }

    } catch (err) {
      console.log('Error in cronjob:', err);
    }
  },
  { scheduled: true }
);


const minute5 = 55;
const hour5 = 23;
let dateObj = new Date();
let month = dateObj.getUTCMonth() + 1; //months from 1-12
let day = dateObj.getUTCDate();
let year = dateObj.getUTCFullYear();
let month_start = `${year}-${month}-01`
let last_day_month = dtUtil.getMonthEndDate(year, month)

const insert_open_sauda = cron.schedule(
  `${minute5} ${hour5} ${last_day_month} * *`,
  async () => {
    try {
      let fields = ['sum(sauda__c.balance_quantity__c),sauda__c.distributor_name__c'];
      const tableName = 'sauda__c';
      const sauda_status = ['Approved', 'OverDue'];
      // let effective_to__c1 = dtUtil.todayDate();
      let WhereClouse = [];
      WhereClouse.push({ fieldName: 'active__c', fieldValue: 'true' });
      WhereClouse.push({ fieldName: 'sauda_document_date__c', fieldValue: month_start, type: "GTE" });
      WhereClouse.push({ fieldName: 'sauda_document_date__c', fieldValue: `${year}-${month}-${last_day_month}`, type: "LTE" });
      WhereClouse.push({ fieldName: 'sauda_status__c', fieldValue: sauda_status, type: 'IN' });
      let offset = '0', limit = '1000';
      let br_sql = qry.SelectAllQry(fields, tableName, WhereClouse, offset, limit, 'group by distributor_name__c');
      console.log("sqlllll",br_sql)

      console.log("sql >>>>>>>>", br_sql);
      let br_result = await client.query(br_sql);
      if (br_result.rows.length > 0) {
        for (let i = 0; i < br_result.rows.length; i++) {

          let pg_id__c = uuidv4();
          let currentDateTime = dtUtil.todayDatetime();

          const targetFields = `distributor_name__c,month__c, year__c,open_sauda_no__c, createddate, update_date__c, pg_id__c`;
          const tableName = 'open_sauda_report__c';
          let fieldTargetFieldsValues = [br_result.rows[i]['distributor_name__c'],month,year,br_result.rows[i]['sum'], currentDateTime, dtUtil.todayDate(), pg_id__c];
          
          let insertIntoOpen = await qry.insertRecord(targetFields, fieldTargetFieldsValues, tableName)
          console.log("Inset succ",insertIntoOpen)
        }
      }

    } catch (err) {
      console.log('Error in cronjob:', err);
    }
  },
  { scheduled: true }
);


module.exports = {
  cronjob,
  sauda_overdue,
  update_overdue,
  insert_open_sauda
};
