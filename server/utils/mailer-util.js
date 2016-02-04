function Mailer(nodemailer, smtpTransport, mUtils) {
    'use strict';
    var self = this;
    var smtpTransport;
    var fromEmail;
    var templates = {
        REGISTRATION_SUCCESS_MAIL_CONTENT :'<p>Dear {0} </p>'
                                            + '<p>Your Bookworm registration is successful</p>'
    };
    this.setSMTPConfig = function(smtpConfig) {
        if(smtpConfig) {
            console.log(smtpConfig);
            smtpTransport = nodemailer.createTransport(smtpTransport(
                {host : smtpConfig.host,
                    secureConnection : false,
                    port: smtpConfig.port,
                    auth: {
                        user: smtpConfig.username,
                        pass: smtpConfig.password
                    }
            }));
            fromEmail = smtpConfig.fromEmail;
        }
    };
    this.sendRegistrationConfirmation = function(user_info) {
        console.log('registration email sending');
        console.log(user_info);
      var emailContentHTML = mUtils.formatWithArguments(templates.REGISTRATION_SUCCESS_MAIL_CONTENT, [user_info.first_name + ' ' + user_info.last_name]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: user_info.email, // list of receivers
            subject: '[BookWorm] Registration Successful', // Subject line,
            text : 'Registration successful!!',
            html: emailContentHTML // html body
        };
        sendEmail(mailOptions);
    };
    function sendEmail(mailOptions){
        if(smtpTransport) {
             smtpTransport.sendMail(mailOptions, function(error, response){
                if(error){
                    console.log("Error: %j",error);
                    console.log(error);
                }else{
                    console.log("Message sent: %j",response);
                }
                // if you don't want to use this transport object anymore, uncomment following line
                // smtpTransport.close(); // shut down the connection pool, no more messages
            });
        }
    }
};
module.exports.Mailer = Mailer;