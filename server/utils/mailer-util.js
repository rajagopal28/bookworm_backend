function Mailer(nodemailer, smtpTransport, mUtils) {
    'use strict';
    var self = this;
    var smtpTransport = smtpTransport;
    var fromEmail, feedbackToEmail;
    var templates = {
        REGISTRATION_SUCCESS_MAIL_CONTENT : { subject: '[BookWorm] Registration Successful',
                                                html: '<h3>Dear {0} </h3><p>Your Bookworm registration is successful. Click on this link to verify your account. <a href="{1}">VerifyAccount</a></p><p> Thanks, BookWorm Team.</p>',
                                                plain : 'Your Bookworm registration is successful'},
        REQUEST_BOOK_MAIL_CONTENT : { subject: '[BookWorm] New borrow request for your book',
                                                html: '<h3>Dear {0} </h3><p> A user named {1}, has requested to borrow your book item <strong>{2}</strong> posted on {3}. Kindly respond to the user with an email directly. Email address : <a href="mailto:{4}">{4}</a></p><p> Thanks, BookWorm Team.</p>',
                                                plain : 'New borrow request on your book item'},
        REQUEST_TO_ADD_NETWORK_CONTENT : { subject: '[BookWorm] New friend request from a fellow bookworm',
                                                html: '<h3>Dear {0} </h3><p> {1}, has requested to add to their friends network. Kindly click on the link to <a href="{2}">Accept</a> their request</p><p> Thanks, BookWorm Team.</p>',
                                                plain : 'New borrow request on your book item'},
        REQUEST_TO_ADDED_TO_NETWORK_CONTENT : { subject: '[BookWorm] Friend request Accepted',
                                                html: '<h3>Dear {0} </h3><p> {1}, has Accepted your friend request</p><p> Thanks, BookWorm Team.</p>',
                                                plain : 'New borrow request on your book item'},
        PROFILE_UPDATE_SUCCESS_MAIL_CONTENT : { subject: '[BookWorm] Profile update Successful',
                                                html: '<h3>Dear {0} </h3><p>Your Bookworm profile has been successfully updated</p><p> Thanks, BookWorm Team.</p>',
                                                plain : 'Profile update successful'},
        LEND_BOOK_SUCCESS_MAIL_CONTENT : { subject: '[BookWorm] Book details added Successfully',
                                                html: '<h3>Dear {0} </h3><p>Your Book <strong>{1}</strong> has been added to the available books list. Thank you for your valuable contribution. Kep contributing.</p><p> Regards, BookWorm Team.</p>',
                                                plain : 'New book lending successful'},
        FEEDBACK_MAIL_CONTENT : { subject: '[BookWorm Feedback] New feedback',
                                                html: '<h3>User {0}, with email {1} has sent a feedback[type={2}] on {3} </h3><p>{4}</p>',
                                                plain : 'New feedback from user'},
        REST_PASSWORD_MAIL_CONTENT : { subject: '[BookWorm] Rest password request',
                                                html: '<h3>Dear {0} </h3><p> We have received your reset credential request. Please click on this <a href="{1}">link </a>to reset your password. Please note that this link will expire by {2}</p><p> Thanks, BookWorm Team.</p>',
                                                plain : 'We have processed your reset request'},
        ACCOUNT_VERIFIED_MAIL_CONTENT : { subject: '[BookWorm] Account verified',
                                                html: '<h3>Dear {0} </h3><p> We have verified your email. Now you can contribute to fellow bookworms.</p><p> Thanks, BookWorm Team.</p>',
                                                plain : 'We have verified your email'}
    };
    this.setSMTPConfig = function(smtpConfig, username, password, fromEmail, feedbackToEmail) {
        if(smtpConfig) {
            console.log(smtpConfig, username, password, fromEmail, feedbackToEmail);
            smtpTransport = nodemailer.createTransport(smtpTransport(
                {host : smtpConfig.host,
                    secureConnection : false,
                    port: smtpConfig.port,
                    auth: {
                        user: username,
                        pass: password
                    }
            }));
            fromEmail = fromEmail;
            feedbackToEmail = feedbackToEmail;
        }
    };
    this.sendRegistrationConfirmation = function(user_info) {
        console.log('registration email sending');
        console.log(user_info);
        var template = templates.REGISTRATION_SUCCESS_MAIL_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [user_info.getFullName(),
                                        user_info.email_link]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: user_info.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
         sendEmail(mailOptions);
    };
    this.sendProfileUpdateConfirmation = function(user_info) {
        console.log('update profile email sending');
        console.log(user_info);
        var template = templates.PROFILE_UPDATE_SUCCESS_MAIL_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [user_info.first_name + ' ' + user_info.last_name]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: user_info.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
         sendEmail(mailOptions);
    };
    this.sendNewBookLendingConfirmation = function(book_item, user_info) {
        console.log('new book lending confirmation sending');
        console.log(book_item);
        var template = templates.LEND_BOOK_SUCCESS_MAIL_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [user_info.getFullName(), book_item.title]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: user_info.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
         sendEmail(mailOptions);
    };
    this.sendBookRequestEmail = function(users_list, book_info) {
        console.log('book request email sending');
        var requester, owner;
        if(users_list[0].username === book_info.borrower_name) {
            requester = users_list[0];
            owner = users_list[1];
        } else {
            requester = users_list[1];
            owner = users_list[0];
        }
        var template = templates.REQUEST_BOOK_MAIL_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [owner.getFullName(),
                                            requester.getFullName(),
                                            book_info.book_name,
                                            book_info.created_lent_ts,
                                            requester.email]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: owner.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
        sendEmail(mailOptions);
    };
    this.sendFriendRequestEmail = function(users_list, user_info) {
        console.log('friend request email sending');
        var requester, owner;
        if(users_list[1].username === user_info.username) {
            requester = users_list[0];
            owner = users_list[1];
        } else {
            requester = users_list[1];
            owner = users_list[0];
        }
        var template = templates.REQUEST_TO_ADD_NETWORK_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [requester.getFullName(),
                                            owner.getFullName(),
                                            user_info.email_link]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: requester.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
        sendEmail(mailOptions);
    };
    this.sendAcceptedFriendRequestEmail = function(users_list, user_info) {
        console.log('friend request email sending');
        var requester, owner;
        if(users_list[0].username === user_info.username) {
            requester = users_list[0];
            owner = users_list[1];
        } else {
            requester = users_list[1];
            owner = users_list[0];
        }
        var template = templates.REQUEST_TO_ADDED_TO_NETWORK_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [requester.getFullName(),
                                            owner.getFullName()]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: owner.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
        sendEmail(mailOptions);
    };
    this.sendFeedbackEmail = function(feedback_info) {
        console.log('feedback email sending');
        var template = templates.FEEDBACK_MAIL_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [feedback_info.author_name ? feedback_info.author_name : 'N/A',
                                            feedback_info.email ? feedback_info.email : 'N/A',
                                            feedback_info.feedback_type,
                                            new Date(),
                                            feedback_info.feedback_text]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: feedbackToEmail, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
        sendEmail(mailOptions);
    };
    this.sendResetPasswordEmail = function(reset_info) {
        console.log('reset password email sending');
        var template = templates.REST_PASSWORD_MAIL_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [reset_info.getFullName(),
                                            reset_info.email_link,
                                            reset_info.password_reset_expiry_ts]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: reset_info.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
            html: emailContentHTML // html body
        };
        sendEmail(mailOptions);
    };
    this.sendAccountVerifiedConfirmation = function(user_info) {
        console.log('account verified email sending');
        var template = templates.ACCOUNT_VERIFIED_MAIL_CONTENT;
        var emailContentHTML = mUtils.formatWithArguments(
                                        template.html,
                                        [user_info.getFullName()]);
        console.log(emailContentHTML);
        var mailOptions = {
            from: fromEmail, // sender address
            to: user_info.email, // list of receivers
            subject: template.subject, // Subject line,
            text : template.plain,
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
