import express from 'express'
const router = express.Router()
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import UserModel from '../models/user.js'
import verifyToken from '../middlewares/token.js'
import sendEmail from '../utils/sendMail.js'

router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/:userId', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.params.userId)
        res.status(200).json(user)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.put('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;
        const { username, firstName, lastName } = req.body;
        
        const existingUser = await UserModel.findById(userId);
        if (!existingUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        existingUser.username = username || existingUser.username;
        existingUser.firstName = firstName || existingUser.firstName;
        existingUser.lastName = lastName || existingUser.lastName;
        
        await existingUser.save()
        res.status(201).json({ message: 'User Updated successfully' });
    } catch (error) {
        console.log('Error updating user:', error);
        res.status(500).json({error: "Internal server error"})
    }
})

router.delete('/', verifyToken, async (req, res) => {
    try {
        const userId = req.userId;

        const existingUser = await UserModel.findById(userId);
        if (!existingUser) {
          return res.status(404).json({ error: 'User not found' });
        }
        console.log(existingUser)
        await UserModel.findByIdAndDelete(req.userId)
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.log('Error deleting user:', error);
        res.status(500).json({error: "Internal server error"})
    }
})

router.post('/register', async (req, res) => {
    try {
        const {username, password, email, firstName, lastName} = req.body
        
        if(password.length < 8){
            return res.status(400).json({ error: 'Password does not meet criteria.' })
        }
        const existingUser = await UserModel.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ error: 'Email is already registered' });
        }
        const existingUsername = await UserModel.findOne({ username });
        if (existingUsername) {
          return res.status(400).json({ error: 'username is already registered' });
        }
    
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = new UserModel({username, email, password: hashedPassword, firstName, lastName});
        await newUser.save()
        
        res.status(201).json({'message': "new user created"})
    } catch (error) {
        console.log('Error in signup:', error);
        res.status(500).json({ error: 'Internal server error' });
    }  
})

router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await UserModel.findOne({ email });
        if (!user) {
          return res.status(401).json({ error: 'User Not Found!' });
        }
        if(user.verified === false){
            return res.status(401).json({ error: 'User Email Not Verified!' });
        }
        const passwordMatch = await bcrypt.compare(password, user.password);
        if (!passwordMatch) {
            return res.status(401).json({ error: 'Wrong Password!' });
        }
        const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
        res.status(200).json({ token: token, userId: user._id, imageUrl: user.imageUrl });
    } catch (error) {
        console.log('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/dashboard', verifyToken, async (req, res) => {
    try {
        console.log(req.userId)
        const user = await UserModel.findById(req.userId)
        res.status(200).json(user)
    } catch (error) {
        console.log('Error in login:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.post('/forgot-password', async (req, res) => {
    try {
        const {email, password} = req.body
        const user = await UserModel.findOne({email})
        if(!user){
            return res.status(400).send(`user with email ${email} doesn't exits`)
        }
        const hashedPassword = await bcrypt.hash(password, 10);
        const resetToken = jwt.sign({userId: user._id}, process.env.RESET_PASSWORD_SECRET, {expiresIn: '1h'})
        const resetLink = `${process.env.BASE_URL}/user/reset-password/${resetToken}/${hashedPassword}`
    
        await sendEmail(email, 'Reset Your Password', `Click on the following link to reset your password: ${resetLink}`)
    
        res.status(200).json({ message: 'Reset email sent. Check your inbox.' });    
    } catch (error) {
        console.log('Error in forgot password route:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
})

router.get('/reset-password/:resetToken/:newPassword', async (req, res) => {
    try {
        const resetToken = req.params.resetToken
        const {newPassword} = req.params

        const decodedToken = jwt.verify(resetToken, process.env.RESET_PASSWORD_SECRET);

        const user = await UserModel.findById(decodedToken.userId);
        if (!user) {
          return res.status(404).json({ error: 'User not found' });
        }
        
        user.password = newPassword;
        await user.save();
        res.status(200).json({ message: 'Password reset successful' });    

    } catch (error) {
        console.log('Error in reset password route:', error);
        res.status(500).json({ error: 'Internal server error' });    
    }
})


export default router