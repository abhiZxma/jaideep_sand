var moment = require('moment');



module.exports = {
    timestampToDate,
    todayDate,
    getDates,
    todayDatetime,
    WeekLateDatetime,
    removeMiliSec,
    currentMonth,
    utcTodayDate,
    ISOtoLocal,
    utcTodayDatetime,
    getMonth,
    getPreviousMonth,
    getYear,
    getMonthEndDate

};

function timestampToDate(timestamp,format){
    timestamp = removeMiliSec(timestamp)
    
    return moment.unix(timestamp).format(format);
}
function todayDate(){
   
    return  moment().format('YYYY-MM-DD');
}

function utcTodayDate(){
    return moment.utc().format('YYYY-MM-DD');
}

function currentMonth(){
   
    return  moment().format('MM');
   
}

function todayDatetime(){
   
    return  moment().format('YYYY-MM-DD HH:mm:ss');
   
} 

function utcTodayDatetime(){
   
    return  moment.utc().format('YYYY-MM-DD HH:mm:ss');
   
} 

function WeekLateDatetime(){
    return  moment().subtract(7,'d').format('YYYY-MM-DD HH:mm:ss');
   
} 

function ISOtoLocal(date){
    let d = new Date(date);
    return d.getFullYear()+"-"+parseInt(d.getMonth()+1)+'-'+d.getDate()
}

function getDates(day, till_date_timestamp, from_date_timestamp) {
    allDates = [];
    try{
        from_date_timestamp = removeMiliSec(from_date_timestamp)
        var monday = moment.unix(from_date_timestamp)
        .startOf('month')
        .day(day);
        if (monday.date() > 7) monday.add(7,'d');
        //till_date_timestamp = moment(till_date).format('X');
    
        while (till_date_timestamp > moment(monday).format('X')) {
           // if (moment(monday).format('X') > from_date_timestamp) {

                allDates.push(moment(monday).format('YYYY-MM-DD'));
                monday.add(7, 'd');
           // }
        }
    }catch(e){
        console.log(e);
    }
    console.log(allDates);
    return allDates;
}

function removeMiliSec(timestamp) {
    
    if (typeof (timestamp) == 'string' && timestamp.length == 13) {
        timestamp = timestamp.substring(0, timestamp.length - 3);
    } else if (typeof (timestamp) == 'number'  && timestamp.toString().length == 13) {
        timestamp = timestamp.toString().substring(0, timestamp.toString().length - 3);
    }
    return timestamp;
}

function getMonth(milliseconds) {
  return moment(milliseconds).format('MMMM');
}

function getPreviousMonth(milliseconds) {
  return moment(milliseconds).subtract('month', 1).format('MMMM');
}

function getYear(milliseconds) {
  return moment(milliseconds).format('YYYY');
}

function getMonthEndDate(year, month){    
    if(Number.isNaN(parseInt(month))){
        month = ["","January","February","March","April","May","June","July",
        "August","September","October","November","December"].indexOf(month);
    }
    const startDate = moment([year, month - 1]);    
    const endDate = moment(startDate).endOf('month').format("DD");    
    return parseInt(endDate);

}