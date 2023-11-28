import express from "express";
import verifyToken from "../middlewares/token.js";
import UserModel from "../models/user.js";
import bcrypt from 'bcrypt'
import sendEmail from '../utils/sendMail.js'


const router = express.Router()

router.put('/update-password', verifyToken, async (req, res) => {
    try {
        const {oldPassword, password} = req.body

        if(password.length < 8){
            return res.status(400).json({ error: 'Password does not meet criteria.' })
        }

        console.log(req.userId)
        const user = await UserModel.findById(req.userId)

        if(!user){
            return res.status(400).send(`user not found!`)
        }
        const passwordMatch = await bcrypt.compare(oldPassword, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Invalid password' });
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        user.password = hashedPassword

        await user.save()
        res.status(201).json({'message': "password updated"})
    
    } catch (error) {
        console.log('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.put('/upload-image', verifyToken, async (req, res) => {
    try {
        const imageUrl = req.body.imageUrl 
        const user = await UserModel.findById(req.userId)
        user.imageUrl = imageUrl
        console.log(imageUrl)
        await user.save()

        res.status(201).json({'message': "password updated"})

    } catch (error) {
        console.log('Error in uploading image:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
} )

router.post('/send-otp', async (req, res) => {
    try {
        console.log('here')
        const {email} = req.body
        console.log(email)
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).send(`user with email ${email} doesn't exits`)
        }
        user.otp =  Math.floor(1000 + Math.random() * 9000)
        await user.save()
        console.log(user)
        await sendEmail(email, 'OTP Verification Code', `To complete the verification process, please use the following OTP (One-Time Password) code:\n ${user.otp}`)
        res.status(200).json({ error: 'OTP verification code sent. Check your inbox.' });    

    } catch (error) {
        console.log('Error in forgot password route:', error);
        res.status(500).json({ error: 'Internal server error' });        
    }
})

router.post('/verify-otp/', async (req, res) => {
    try {
        const {email, otp} = req.body
        console.log(otp, email)
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).send(`user with email ${email} doesn't exits`)
        }
        if(user.otp === otp){
            console.log(user.otp)
            user.verified = true
            await user.save()
            return res.status(200).json({ message: 'OTP verified successfully' });    
        }else{
            return res.status(401).json({ error: 'Wrong OTP!' });
        }
    } catch (error) {
        console.log('Error in forgot password route:', error);
        res.status(500).json({ error: 'Internal server error' });        
    }
})


export default router