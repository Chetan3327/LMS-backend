import mongoose from 'mongoose'

const CourseSchema = new mongoose.Schema({
    title: {type: String, required: true},
    image: {type: String, },
    description: {type: String, },
    category: {type: String, },
    price: {type: String, default: 0},
    purchases: {type: String, default: 0},
    chapters: [{type: mongoose.Types.ObjectId, default: [''], ref: 'chapters'}],
    userId: {type: mongoose.Types.ObjectId, required: true, ref: 'users'}
})

const CourseModel = mongoose.model('courses', CourseSchema)
export default CourseModel