const mongoose = require('mongoose')

// creates an embedded subdocument schema
const commentSchema = new mongoose.Schema({ content: String })

const blogSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  author: {
    type: String,
  },
  url: {
    type: String,
    required: true,
  },
  likes: {
    type: Number
  },
  comments: [commentSchema], // array of subdocuments
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
})

// set=add 'toJSON' property (which is a function)
// res.json calls JSON.stringify() method
// .toJSON() customizes the method call
// here the result is id in String format and _v removed
blogSchema.set('toJSON', {
  transform: (document, returnedObject) => {
    returnedObject.id = returnedObject._id.toString()
    delete returnedObject._id
    delete returnedObject.__v
    if (returnedObject.comments) {
      returnedObject.comments.map(comment => {
        comment.id = comment._id
        delete comment._id
      })
    }
  }
})

module.exports = mongoose.model('Blog', blogSchema)