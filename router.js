    
const notificationCtrl = require('./controllers/notification/notification.controller');


module.exports = function (app) {
    app.use('/notification', notificationCtrl);
};


