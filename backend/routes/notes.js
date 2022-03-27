const express = require('express');
const fetchUser = require('../middleware/fetchUser');
const Note = require('../models/Note');
const notesRouter = express.Router();
const { body, validationResult } = require("express-validator");

// Route 1: Get all the Notes using : GET "/api/auth/fetchallnotes" . Login required
notesRouter.get('/fetchallnotes', fetchUser, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user.id })
        res.json(notes);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Route 2: Add a Note using : POST "/api/auth/addnote" . Login required
notesRouter.post('/addnote', fetchUser, [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be of atleast 5 characters").isLength({
        min: 5,
    }),
], async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const note = new Note({
            title, description, tag, user: req.user.id
        });
        const savedNote = await note.save();

        res.json(savedNote);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});


// Route 3: Update an existing Note using : PUT "/api/auth/updatenote" . Login required
notesRouter.put('/updatenote/:id', fetchUser, /* [
    body("title", "Enter a valid title").isLength({ min: 3 }),
    body("description", "Description must be of atleast 5 characters").isLength({
        min: 5,
    }),
], */ async (req, res) => {
    try {
        const { title, description, tag } = req.body;

        /* const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        } */

        const newNote = {};
        if(title){
            newNote.title = title;
        }
        if(description){
            newNote.description = description;
        }
        if(tag){
            newNote.tag = tag;
        }

        // Find the note to be updated and update it
        let note = await Note.findById(req.params.id);
        if(!note){
            return res.status(404).send("Not found");
        }

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndUpdate(req.params.id, {$set: newNote}, {new: true})

        res.json(note);
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});

// Route 4: Delete a Note using : DELETE "/api/auth/deletenote" . Login required
notesRouter.delete('/deletenote/:id', fetchUser, async (req, res) => {
    try {

        // Find the note to be deleted and delete it
        let note = await Note.findById(req.params.id);
        if(!note){
            return res.status(404).send("Not found");
        }

        if(note.user.toString() !== req.user.id){
            return res.status(401).send("Not Allowed");
        }

        note = await Note.findByIdAndDelete(req.params.id)

        res.json({"Success": "Note has been deleted", "note": note});
    } catch (error) {
        console.log(error.message);
        res.status(500).send("Internal Server Error");
    }
});

module.exports = notesRouter;