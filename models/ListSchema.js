const mongoose = require('mongoose');

const ListSchema = new mongoose.Schema({
    taskId: {
        type: String,
        required: true,
        unique: true,
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    type: {
        type: String,
        required: true,
    },
    status: {
        type: String,
        required: true,
        enum: ['In Progress', 'Completed', 'Cancelled', 'Backlog'],
        trim: true,
        default: 'pending'
    },
    priority: {
        type: String,
        required: true,
        enum: ['Low', 'Medium', 'High'],
        trim: true,
        default: 'medium'
    },
    date: {
        type: Date,
        default: Date.now
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    description: {
        type: String,
        trim: true
    },
    expireDate: {
        type: Date,
        default: null
    },
    time : {
        type: String,
        trim: true,
        default: null
    },
})

const List = mongoose.model('List', ListSchema);

module.exports = List;