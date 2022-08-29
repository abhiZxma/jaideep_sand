const express = require('express');
const router = express.Router();
const _ = require('lodash');
const { getUsersNotifications, newLeadCreated, newAccountCreated, newSudaRateCreated, newDisDealerMappingCreated, salesOrderStatusUpdate, newEventCreated, newSchemeLaunched } = require('./notification.service');

router.get('/triggerNotification/:eventType/:sfid', triggerNotification);
router.get('/getAllNotification', usersNotifications);

module.exports = router;

function usersNotifications(req, res, next) {
  try {
    if (!_.isEmpty(req.headers.token)) {
      getUsersNotifications(req)
        .then((notifications) => res.status(notifications.status).json(notifications.response))
        .catch((err) => next(err));
    } else {
      res.status(400).json({ success: false, message: 'You do not have authorised access.' });
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}

function triggerNotification(req, res, next) {
  try {
    switch (req.params.eventType) {
      case 'NEW_LEAD_CREATED':
        newLeadCreated(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
        break;

      case 'NEW_INFLUENCER_CREATED':        
        newAccountCreated(req.params.sfid, 'Influencer');
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
        break;

      case 'NEW_DEALER_CREATED':
        newAccountCreated(req.params.sfid, 'Dealer');
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
        break;

      case 'NEW_DISTRIBUTOR_CREATED':
        newAccountCreated(req.params.sfid, 'Distributor');
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
        break;

      case 'NEW_SAUDA_RATE_CREATED':
        newSudaRateCreated(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification sent successfully' });
        break;

      case 'NEW_DIS_DEALER_MAPPING_CREATED':
        newDisDealerMappingCreated(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification triggered successfully' });
        break;

      case 'SALES_ORDER_DISPACTHED':
        salesOrderStatusUpdate(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification triggered successfully' });
        break;

      case 'SALES_ORDER_VEHICLE_LOADING':
        salesOrderStatusUpdate(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification triggered successfully' });
        break;

      case 'SALES_ORDER_DELIVERED':
        salesOrderStatusUpdate(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification triggered successfully' });
        break;

      case 'NEW_EVENT_CREATED':
        newEventCreated(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification triggered successfully' });
        break;

      case 'NEW_SCHEME_LAUNCHED':
        newSchemeLaunched(req.params.sfid);
        res.status(200).json({ success: true, message: 'Notification triggered successfully' });
        break;

      default:
        res.status(400).json({ success: true, message: 'No event found!' });
        break;
    }
  } catch (e) {
    res.status(500).json({ success: false, error: 'Internal server error.' });
  }
}
