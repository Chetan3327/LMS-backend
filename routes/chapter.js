import express from 'express'
import verifyToken from '../middlewares/token.js'
import CourseModel from '../models/course.js'
import ChapterModel from '../models/chapter.js'
import UserModel from '../models/user.js'
const router = express.Router()

router.post('/:courseId', verifyToken, async (req, res) => {
    try {
        console.log('object')
        const course = await CourseModel.findById(req.params.courseId)
        if (!course) {
            return res.status(404).json({ error: 'Course not found' });
        }
        const chapter = await ChapterModel.create({...req.body, courseId: course._id})
        if (!chapter) {
            return res.status(500).json({ error: 'Failed to create the chapter' });
        }

        course.chapters.push(chapter._id)
        await course.save()

        res.status(200).json({ message: 'Chapter Created successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.put('/:chapterId', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }

        const chapter = await ChapterModel.findById(req.params.chapterId)
        if(!chapter){
            return res.status(403).json({ error: 'Chapter Not Found!' });
        }
        await ChapterModel.findByIdAndUpdate(chapter._id, req.body)

        res.status(200).json({ message: 'Chapter Updated successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.delete('/:chapterId', verifyToken, async (req, res) => {
    try {
        const user = await UserModel.findById(req.userId)
        if (!user) {
            return res.status(404).json({ error: 'User not found' });
        }
        const chapter = ChapterModel.findById(req.params.chapterId)
        if(!chapter || !chapter.courseId.equals(req.params.chapterId)){
            return res.status(403).json({ error: 'You do not have permission to delete this course' });
        }

        await CourseModel.findByIdAndUpdate(req.userId, {$pull: {chapters: req.params.chapterId}})

        await ChapterModel.findByIdAndDelete(req.params.chapterId)

        res.status(200).json({ message: 'Chapter Deleted successfully' });
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/:courseId', verifyToken, async (req, res) => {
    try {
        const chapters = await ChapterModel.find({courseId: req.params.courseId})
        if(!chapters){
            return res.status(404).json({ error: 'chapters not found' });
        }        
        res.status(200).json(chapters)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})

router.get('/:courseId/:chapterId', verifyToken, async (req, res) => {
    console.log('getting chapter info')
    try {
        const course = await CourseModel.findById(req.params.courseId)
        if(!course){
            return res.status(404).json({ error: 'Course not found' });
        }        
        if(!(course.chapters.includes(req.params.chapterId))){
            return res.status(404).json({ error: 'Chapter not found' });
        }
        const chapter = await ChapterModel.findById(req.params.chapterId)
        if(!chapter){
            return res.status(404).json({ error: 'chapter not found' });
        }        
        res.status(200).json(chapter)
    } catch (error) {
        console.log(error)
        res.status(500).json({error: "Internal server error"})
    }
})


export default router