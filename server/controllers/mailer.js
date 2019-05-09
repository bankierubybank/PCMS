const nodemailer = require('nodemailer');
const config = require('../config/environments/test.json');
const logger = require('./logger.js');

/**
 * 
 * @param {String} receiverMail Receiver's E-mail address.
 * @param {String} vmName VM Name.
 * @param {String} status Request status (Approved, Rejected)
 */
const send = async (receiverMail, vmName, status) => {
    let transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email_address,
            pass: config.email_password
        }
    });

    let mailOptions = {
        from: 'uranium@it.kmitl.ac.th <58070020@kmitl.ac.th>',
        to: receiverMail,
        subject: '',
        text: ''
    }

    if (status == 'Approved') {
        mailOptions.subject = `VM: ${vmName} ได้รับการอนุมัติแล้ว`
        mailOptions.text = `VM: ${vmName} ได้รับการอนุมัติแล้ว`
    } else if (status == 'Rejected') {
        mailOptions.subject = `VM: ${vmName} ไม่ได้รับการอนุมัติ`
        mailOptions.text = `VM: ${vmName} ไม่ได้รับการอนุมัติ\nโปรดติดต่อเจ้าหน้าที่ IT Support`
    }

    transporter.sendMail(mailOptions, (err, info) => {
        if (err) {
            logger.error(err);
        } else {
            logger.info(info);
        }
    })
}

module.exports = {
    send
};