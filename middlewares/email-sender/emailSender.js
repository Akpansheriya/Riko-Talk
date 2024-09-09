const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    service: "gmail",
    port: 465,
    secure: true,
    auth: {
      user: "ankitpansheriya123@gmail.com",
      pass: "raco yqdm vywe isjl",
    },
    tls: {
      rejectUnauthorized: false,
    },
  });


const sendEmail = async (to, subject, text) => {
  const mailOptions = {
    from: 'ankitpansheriya123@gmail.com', 
    to: to,                       
    subject: subject,            
    text: text,                  
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent: ' + info.response);
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;
