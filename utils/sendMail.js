import nodemailer from 'nodemailer'
import dotenv from 'dotenv'

dotenv.config()
const EMAIL = process.env.EMAIL
const PASSWORD = process.env.PASSWORD

const sendEmail = async (email, subject, text) => {
    try {
        const transporter = nodemailer.createTransport({
            service:"gmail", 
            auth: {
                user: EMAIL,
                pass: PASSWORD
            }
        })
        await transporter.sendMail({
            from: EMAIL,
            to: email,
            subject: subject,
            text: text
        })
    } catch (error) {
        console.log(error, 'email not sent')
    }
}
export default sendEmail