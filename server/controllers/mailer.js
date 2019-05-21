const nodemailer = require('nodemailer');
const config = require('../config/environments/test.json');
const logger = require('./logger.js');

/**
 * 
 * @param {String} receiverMail Receiver's E-mail address.
 * @param {String} vmName VM Name.
 * @param {String} status Request status (Approved, Rejected)
 */
const send = async (receiverMail, vm, status) => {
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
        หากต้องการใช้งาน VM โปรดติดต่อเจ้าหน้าทีไอทีซัพพอร์ตเพื่อเจรจา Spec ที่สามารถใช้ได้
        
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
    }

    transporter.sendMail(mailOptions).catch(err => logger.error(err));
}

module.exports = {
    send
};