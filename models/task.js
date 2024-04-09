const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true
  },
  author: {
    type: String,
    required: true
  },
  name: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  isImportant: {
    type: Boolean,
    required: true
  },
  isDone: {
    type: Boolean,
    required: true
  },
  isPrivate: {
    type: Boolean,
    required: true
  }
});

const TaskModel = mongoose.model('Task', taskSchema);

module.exports = TaskModel;
