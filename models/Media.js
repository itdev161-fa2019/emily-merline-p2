import mongoose from 'mongoose'

const MediaSchema = new mongoose.Schema({
    user: {
        type: 'ObjectId',
        ref: 'User'
    },
    title: {
        type: String,
        required: true
    },
    creator: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    units: {
        type: String,
        required: true
    },
    progress: {
        type: String,
        required: true
    },
    unitType: {
        type: String,
        required: true
    }
})

const Media = mongoose.model('media', MediaSchema);

export default Media