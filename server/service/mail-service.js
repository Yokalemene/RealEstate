const nodemailer = require('nodemailer');

class MailService {
    constructor() {
        this.transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST,
            port: process.env.SMTP_PORT,
            secure: false,
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASSWORD
            }
        });
    }

    async sendActivationMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Активация аккаунта',
            text: '',
            html: `
                <div>
                    <h1>Для активации аккаунта, пожалуйста, нажмите на ссылку ниже:</h1>
                    <a href="${link}">${link}</a>
                </div>
            `
        });
    }

    async sendPasswordResetMail(to, link) {
        await this.transporter.sendMail({
            from: process.env.SMTP_USER,
            to,
            subject: 'Восстановление пароля',
            text: '',
            html: `
                <div>
                    <h1>Вы получили это письмо, потому что кто-то запросил процедуру восстановления пароля. Если это были вы, то просто проигнорируйте данное письмо. Чтобы восстановить пароль перейдите по ссылке ниже:</h1>
                    <a href="${link}">${link}</a>
                </div>
            `
        });
    }
}

module.exports = new MailService();