import NoteContext from "./noteContext";
import { useState } from "react";


const NoteState = (props)=>{
  const host = "http://localhost:5000";
    const notesInitial = [];

      const [notes, setNotes] = useState(notesInitial);

      // Get all Notes
      const getAllNote = async ()=>{
        // API Call
        const url = `${host}/api/notes/fetchallnotes`
        const response = await fetch(url, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
          },
        });
        const json =  await response.json();
        setNotes(json);

      }

      //Add a Note
      const addNote = async (title, description, tag)=>{
        // API Call
        const url = `${host}/api/notes/addnote`
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({title, description, tag})
        });
        const note =  await response.json();
        setNotes(notes.concat(note));

      }

      //Delete a Note
      const deleteNote = async (id)=>{
        // API Call
        const url = `${host}/api/notes/deletenote/${id}`
        const response = await fetch(url, {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
          }
        });
        const json =  await response.json();
        console.log(json);
        const newNote = notes.filter((note)=>{return note._id!==id})
        setNotes(newNote);
      }

      //Edit a Note
      const editNote = async (id, title, description, tag)=>{
        // API Call
        const url = `${host}/api/notes/updatenote/${id}`
        const response = await fetch(url, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'auth-token': localStorage.getItem('token')
          },
          body: JSON.stringify({title, description, tag})
        });
        const json =  response.json();
        console.log(json);
        let newNotes = JSON.parse(JSON.stringify(notes))
        // logic to edit in client
        for (let index = 0; index < notes.length; index++) {
          const element = notes[index];
          if (element._id===id) {
            newNotes[index].title = title;
            newNotes[index].description = description;
            newNotes[index].tag = tag;
            break;
          }
        }
        setNotes(newNotes);

      }

    
    return (
        <NoteContext.Provider value={{notes, addNote, deleteNote, editNote, getAllNote}}>
            {props.children}
        </NoteContext.Provider>
    )
}

export default NoteState;