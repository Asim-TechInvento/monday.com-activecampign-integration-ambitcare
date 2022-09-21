const nodemailer = require('nodemailer');
const sendMail = (err) => {

   var transporter = nodemailer.createTransport({
        host: 'smtp-mail.outlook.com',
        secureConnection: false,
        tls: {
          ciphers:'SSLv3'
       },
        port: 587,
        auth: {
          user: 'justtesting38@outlook.com',
          pass: 'Sample@123'
        },
        logger: true
      });
      
      var mailOptions = {
        from: 'justtesting38@outlook.com',
        to: 'kkhan@sdlccorp.com',
        subject: 'There is an issue in syncing data from Monday.com to ActiveCampaign for Ambit Care',
        text: err
      };
        // raise an email notification
        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
            } else {
              console.log('Email sent: ' + info.response);
            }
          });
}

// sendMail()

setTimeout(()=>{},1000* 69)

module.exports = sendMail;
