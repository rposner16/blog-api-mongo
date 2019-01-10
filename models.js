"use strict"

const mongoose = require("mongoose");

// Creating a blog post schema
const blogPostSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {
        firstName: {type: String, required: true},
        lastName: {type: String, required: true}
    }
    //created: {type: String, required: true}
});

// Virtual for making author name readable
blogPostSchema.virtual("authorName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

// Instance method for serializing
blogPostSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName,
        created: this.created
    };
};

const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost };