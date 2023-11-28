import express from 'express'
import verifyToken from '../middlewares/token.js'
import UserModel from '../models/user.js'
import CourseModel from '../models/course.js'
const router = express.Router()

router.post('/:courseId', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const course = await CourseModel.findByIdAndUpdate(req.params.courseId, {$inc: {purchases: 1}})
        if (!course) {
            return res.status(500).json({ error: 'Failed to Purchase the course' });
        }
        
        user.purchasedCourses.push(course._id)
        await user.save()
        
        res.status(200).json({ message: 'Course Purchased successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).populate('purchasedCourses')
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const purchasedCourses = user.purchasedCourses
        res.status(200).json(purchasedCourses);
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})
    
export default router