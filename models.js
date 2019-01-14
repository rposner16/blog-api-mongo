"use strict"

const mongoose = require("mongoose");

// Author schema
const authorSchema = mongoose.Schema({
    firstName: "string",
    lastName: "string",
    userName: {
        type: "string",
        unique: true
    }
});

// Comment schema
const commentSchema = mongoose.Schema({ 
    content: "string" 
    }
);

// Creating a blog post schema
const blogPostSchema = mongoose.Schema({
    title: {type: String, required: true},
    content: {type: String, required: true},
    author: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Author"
    },
    conmments: [commentSchema],
    createdAt: {type: Date}
});

// Pre hooks for findOne and find
blogPostSchema.pre("findOne", function(next) {
    this.populate("author");
    next();
});

blogPostSchema.pre("find", function(next) {
    this.populate("author");
    next();
});

// Virtual for making author name readable
blogPostSchema.virtual("authorName").get(function() {
    return `${this.author.firstName} ${this.author.lastName}`.trim();
});

authorSchema.virtual("authorName").get(function() {
    return `${this.firstName} ${this.lastName}`.trim();
});

// Instance method for serializing
blogPostSchema.methods.serialize = function() {
    return {
        id: this._id,
        title: this.title,
        content: this.content,
        author: this.authorName,
        comments: this.comments,
        createdAt: this.createdAt
    };
};

authorSchema.methods.authorSerialize = function() {
    return {
        id: this.id,
        name: this.authorName,
        userName: this.userName
    };
};

const Author = mongoose.model("Author", authorSchema);
const BlogPost = mongoose.model("BlogPost", blogPostSchema);

module.exports = { BlogPost, Author };