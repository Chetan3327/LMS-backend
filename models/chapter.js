import mongoose from 'mongoose'

const ChapterSchema = new mongoose.Schema({
    title: {type: String, required: true},
    description: {type: String},
    access: {type: String},
    video: {type: String},
    courseId: {type: mongoose.Types.ObjectId, requried: true, ref: 'courses'}
})
const ChapterModel = mongoose.model('chapters', ChapterSchema)
export default ChapterModel