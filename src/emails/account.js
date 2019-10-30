const sgMail = require('@sendgrid/mail');

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendWelcomeEmail = (email, name) => {
    sgMail.send({
        to: email, 
        from: 'jeremy.morrison36@gmail.com',
        subject: 'Welcome to the app!',
        text: `Welcome to the app, ${name}. Let me know how you are enjoying it.`
    })
}

const sendCancellationEmail = (email, name) => {
    sgMail.send({
        to: email,
        from: "jeremy.morrison36@gmail.com",
        subject: "We're sad to see you go!",
        text: `Sorry to see you leave so soon, ${name}! Let us know why if you have a sec.`
    });
}

module.exports = {
    sendWelcomeEmail,
    sendCancellationEmail
}