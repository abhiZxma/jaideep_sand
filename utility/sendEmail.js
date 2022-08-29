const nodemailer = require('nodemailer');
const path=require('path')
const fs=require('fs')

const to_mail = 'harshit.jaiswal@zoxima.com,ajay.verma@zoxima.com';
const cc_mail = '';

module.exports = {
    email_error_log,
    sendSaudaMail
};

function email_error_log(subject, text) {

    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'api.backend@zoxima.com',
            pass: 'sqrzcqidvbhfowbj',
        }
    });

    var mailOptions = {
        //team member
        to: `${to_mail}`,
        cc: `${cc_mail}`,
        subject: `${subject}`,
        text: `${text}`
    };

    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
}
async function sendSaudaMail(file_name) {
    const FileDirectoryPath = path.join(__dirname, `../temp/logs/${file_name}`);
  
  
    var transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: 'api.backend@zoxima.com',
            pass: 'sqrzcqidvbhfowbj',
        }
    });
  
    var mailOptions = {
        //team member
        to: `abhishek.tiwari@zoxima.com`,
        cc: `harshit.jaiswal@zoxima.com,ajay.verma@zoxima.com`,
        subject: `Sauda Mail ${file_name}`,
        text: ``,
        attachments: [
            {   // file on disk as an attachment
                filename: `${file_name}`,
                path: FileDirectoryPath
            }
        ]
    };
  
    transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
            console.log(error);
        } else {
            console.log('Email sent: ' + info.response);
        }
    });
    
  }