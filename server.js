"use strict"

const express = require("express");
const mongoose = require("mongoose");

mongoose.Promise = global.Promise;

const { PORT, DATABASE_URL } = require("./config");
const { BlogPost } = require("./models");

const app = express();
app.use(express.json());

// GET /posts returns all blog posts.
app.get("/posts", (req, res) => {
    BlogPost.find()
    .then(blogPosts => {
        res.json({
            blogPosts: blogPosts.map(blogPost => blogPost.serialize())
        });
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

// GET /posts/:id returns a single post with the given id (if it exists)
app.get("/posts/:id", (req, res) => {
    BlogPost.findById(req.params.id)
    .then(blogPost => {
        res.json(blogPost.serialize());
    })
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

// POST /posts creates a new blog post
app.post("/posts", (req, res) => {

    // Making sure that the request has the required fields
    const requiredFields = ["title", "content", "author"];
    for (let i = 0; i < 3; i++) {
        const field = requiredFields[i];
        if (!(field in req.body)) {
            const message = `Missing \`${field}\` in request body`;
            console.error(message);
            return res.status(400).send(message);
        }
    }

    BlogPost.create({
        title: req.body.title,
        content: req.body.content,
        author: req.body.author
    })
    .then(blogPost => res.status(201).json(blogPost.serialize()))
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

// PUT /posts/:id updates the blog post with the given id
app.put("/posts/:id", (req, res) => {
    
    // Make sure ids are present and match
    if (!(req.params.id && req.body.id && req.params.id === req.body.id)) {
        const message = `Request path id (${req.params.id}) and request body id (${req.body.id}) must match.`;
        console.error(message);
        return res.status(400).json({message: message});
    }

    const fieldsToUpdate = {};
    // Can't update id or created
    const ableToUpdate = ["title", "content", "author"];
    ableToUpdate.forEach(field => {
        if (field in req.body) {
            fieldsToUpdate[field] = req.body[field];
        }
    });

    BlogPost.findByIdAndUpdate(req.params.id, { $set: fieldsToUpdate })
    .then(blogPost => res.status(204).end())
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

// DELETE /posts/:id deletes the blog post with the given id
app.delete("/posts/:id", (req, res) => {

    BlogPost.findByIdAndRemove(req.params.id)
    .then(blogPost => res.status(204).end())
    .catch(err => {
        console.error(err);
        res.status(500).json({message: "Internal server error"});
    });
});

let server;

function runServer(databaseUrl, port=PORT) {
    return new Promise((resolve, reject) => {
        mongoose.connect(
            databaseUrl, 
            err => {
                if (err) {
                    return reject(err);
                }
                server = app.listen(port, () => {
                    console.log(`App listening on port ${port}`);
                    resolve();
                })
                .on("error", err => {
                    mongoose.disconnect();
                    reject(err);
                });
            }
        );
    });
}

function closeServer() {
    return mongoose.disconnect().then(() => {
        return new Promise((resolve, reject) => {
            console.log("Closing server");
            server.close(err => {
                if (err) {
                    return reject(err);
                }
                resolve();
            });
        });
    });
}

if (require.main === module) {
    runServer(DATABASE_URL).catch(err => console.error(err));
}

module.exports = { app, runServer, closeServer };