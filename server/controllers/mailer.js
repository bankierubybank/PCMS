const nodemailer = require('nodemailer');
const config = require('../config/environments/config.json');
const logger = require('./logger.js');

/**
 * Send VM request status via E-mail.
 * @param {String} receiverMail A string of receiver's E-mail address.
 * @param {JSON} vm A JSON object of VM details.
 * @param {String} status A string of VM request status. (Approved, Rejected, Extended, Backup, NearExpiration)
 * @param {String} reason A string of reasons for rejection.
 */
async function send(receiverMail, vm, status, reason) {
    let transporter = await nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: config.email_address,
            pass: config.email_password
        }
    });

    let mailOptions = {
        from: 'uranium IT KMITL',
        to: receiverMail,
        subject: '',
        text: ''
    }

    if (status == 'Approved') {
        mailOptions.subject = `VM: ${vm.Name} ได้รับการอนุมัติแล้ว`
        mailOptions.text = `VM: ${vm.Name} ได้รับการอนุมัติแล้ว
        โดยมี Spec ดังนี้
        VM Name     : ${vm.Name}
        Core CPU    : ${vm.NumCpu}
        Memory GB   : ${vm.MemoryGB}
        Harddisk GB : ${vm.ProvisionedSpaceGB}
        OS          : ${vm.OS}
        Requestor   : ${vm.Requestor.Lecturer}
        Requestor   : ${vm.Requestor.Student}
        Course      : ${vm.Requestor.Course}
        Type        : ${vm.Type}
        Start Date  : ${vm.StartDate}
        End Date    : ${vm.EndDate}
        หากพบปัญหาหรือมีข้อเสนอแนะใด ๆ โปรดแจ้งเจ้าหน้าทีไอทีซัพพอร์ต

        อีเมล์นี้ถูกสร้างขึ้นด้วย ระบบบริหารจัดการ Private Cloud
        คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
        `
    } else if (status == 'Rejected') {
        mailOptions.subject = `VM: ${vm.Name} ไม่ได้รับการอนุมัติ`
        mailOptions.text = `VM: ${vm.Name} ไม่ได้รับการอนุมัติ
        โดยมี Spec ดังนี้
        VM Name     : ${vm.Name}
        Core CPU    : ${vm.NumCpu}
        Memory GB   : ${vm.MemoryGB}
        Harddisk GB : ${vm.ProvisionedSpaceGB}
        OS          : ${vm.OS}
        Requestor   : ${vm.Requestor.Lecturer}
        Requestor   : ${vm.Requestor.Student}
        Course      : ${vm.Requestor.Course}
        Type        : ${vm.Type}
        Start Date  : ${vm.StartDate}
        End Date    : ${vm.EndDate}
        เจ้าหน้าที่ไอทีซัพพอร์ทปฎิเสธคำขอเนื่องจาก ${reason}
        หากต้องการใช้งาน VM โปรดติดต่อเจ้าหน้าทีไอทีซัพพอร์ตเพื่ออนุมัติคำขอ
        หรือทำการยื่นคำขอใหม่อีกครั้ง
        
        อีเมล์นี้ถูกสร้างขึ้นด้วย ระบบบริหารจัดการ Private Cloud
        คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
        `
    } else if (status == 'Extended') {
        mailOptions.subject = `VM: ${vm.Name} ได้รับการอนุมัติการต่ออายุ`
        mailOptions.text = `VM: ${vm.Name} ได้รับการอนุมัติการต่ออายุ
        โดยสามารถใช้งานได้ถึง ${vm.EndDate}

        อีเมล์นี้ถูกสร้างขึ้นด้วย ระบบบริหารจัดการ Private Cloud
        คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
        `
    } else if (status == 'Backup') {
        mailOptions.subject = `VM: ${vm.Name} ได้ถูกสำรองข้อมูลแล้ว`
        mailOptions.text = `VM: ${vm.Name} ได้ถูกสำรองข้อมูลแล้ว
        
        อีเมล์นี้ถูกสร้างขึ้นด้วย ระบบบริหารจัดการ Private Cloud
        คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
        `
    } else if (status == 'NearExpiration') {
        mailOptions.subject = `VM: ${vm.Name} ใกล้ถึงเวลาหมดอายุ`
        mailOptions.text = `VM: ${vm.Name} ใกล้ถึงเวลาหมดอายุ
        โดยสามารถใช้งานได้ถึง ${vm.EndDate} โปรดรีบต่ออายุก่อนหมดระยะเวลา

        อีเมล์นี้ถูกสร้างขึ้นด้วย ระบบบริหารจัดการ Private Cloud
        คณะเทคโนโลยีสารสนเทศ สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง
        `
    }

    transporter.sendMail(mailOptions).catch(err => logger.error(err));
}

module.exports = {
    send
};