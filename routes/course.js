import express from 'express'
import verifyToken from '../middlewares/token.js'
import CourseModel from '../models/course.js'
import UserModel from '../models/user.js'
const router = express.Router()

router.post('/', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const course = await CourseModel.create({...req.body, userId: user._id})
        if (!course) {
            return res.status(500).json({ error: 'Failed to create the course' });
        }

        user.createdCourses.push(course._id)
        await user.save()

        res.status(200).json({ message: 'Course Created successfully', courseId: course._id });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.put('/:courseId', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const course = await CourseModel.findById(req.params.courseId)
        if(!course || !course.userId.equals(req.userId)){
            return res.status(403).json({ error: 'You do not have permission to delete this course' });
        }
        await CourseModel.findByIdAndUpdate(course._id, req.body)

        res.status(200).json({ message: 'Course Updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.delete('/:courseId', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        console.log(user)

        const course = await CourseModel.findById(req.params.courseId)
        console.log(course)
        if(!course || !(course.userId.equals(req.userId))){
            return res.status(403).json({ error: 'You do not have permission to delete this course' });
        }

        await UserModel.findByIdAndUpdate(req.userId, {$pull: {createdCourses: req.params.courseId}})

        await CourseModel.findByIdAndDelete(req.params.courseId)

        res.status(200).json({ message: 'Course Deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/created', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId).populate('createdCourses')
        if(!user){
            return res.status(404).json({ error: 'User not found' });
        }        
        const createdCourses = user.createdCourses
        res.status(200).json(createdCourses)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/', verifyToken, async (req, res) => {
    try {
        const courses = await CourseModel.find({})
        if(!courses){
            return res.status(404).json({ error: 'Courses not found' });
        }        
        res.status(200).json(courses)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/:courseId', verifyToken, async (req, res) => {
    try {
        const course = await CourseModel.findById(req.params.courseId).populate('chapters')
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }        
        res.status(200).json(course)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})



export default router