import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    firstName: {
        type: String,
    },
    lastName: {
        type: String,
    },
    username: {
        type: String,
        required: true
    },
    email: {
        type: String, 
        required: true
    },
    password: {
        type: String,
        required: true
    },
    imageUrl: {
        type: String,
        default: "None"
    },
    otp: {
        type: Number,
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdCourses: [{type: mongoose.Types.ObjectId, ref: 'courses'}],
    purchasedCourses: [{type: mongoose.Types.ObjectId, ref: 'courses'}]
},
{ timestamps: true })

const UserModel = mongoose.model('users', userSchema)
export default UserModel