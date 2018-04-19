const transporter = require("./transporter");

const sendConfirmationMail = (newUser) => {
  let userData = newUser;
  return transporter
    .sendMail({
      from: '"My Awesome Project 👻" <myawesome@project.com>',
      to: userData.email, 
      subject: `Hello, ${userData.username}`, 
      text: 'Awesome Message',
      html: `Your confirmation link is <a href="http://localhost:3000/auth/confirm/${userData.confirmationCode}">here</a>!`
    })
    .then(info => console.log(info));
};

module.exports = sendConfirmationMail;