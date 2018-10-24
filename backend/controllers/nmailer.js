'use strict'
let nodemailer = require('nodemailer');
let transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.MAIL_USER,
    pass: process.env.MAIL_PASS
  }
});


let nMailer = {
	home: async (req,res)=>{
		let correo = req.params.correo

		var mailOptions = {
		  from: process.env.MAIL_USER,
		  to: process.env.MAIL_TO,
		  subject: 'Sending Email using Node.js',
		  text: 'That was easy!'
		};
		await transporter.sendMail(mailOptions, function(error, info){
		  if (error) {
		    console.log(error);
		  } else {
		    console.log('Email sent: ' + info.response);
		  }
		}); 
		return res.status(200).send({message: correo});
	}
}

module.exports = nMailer






