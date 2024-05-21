import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';
import { Container } from 'react-bootstrap';
import { Routes, Route, Navigate } from 'react-router-dom';
import { NewNote } from './NewNote';
import { useEffect, useState } from 'react';
import { v4 as uuidV4 } from 'uuid';
import { NoteList } from './NoteList';
import { NoteLayout } from './NoteLayout';
import { EditNote } from './EditNote';
import { Note } from './Note';
import { Profile } from './Profile';
import { RequireToken } from './Auth';
import { Auth } from './Register';
import axios from 'axios';
import { connectBackend } from './connectStorage';

function App() {
  const [notes, setNotes] = useState([]);
  const [tags, setTags] = useState([]);
  const [user, setUser] = useState([]);

  const connect = (method, handler, data) => {
    connectBackend(handler, method, data, 'application/json', null);
  };

  useEffect(() => {
    const getData = (endpoint, setter) => {
      connectBackend(endpoint, 'get', {}, 'application/json', setter);
    };
    getData('notes', setNotes);
    getData('tags', setTags);
    getData('users', setUser);
  }, []);

  const notesWithTags = notes.map((note) => {
    return {
      ...note,
      tags: tags.filter((tag) =>
        note.tags.map((tag) => tag.id).includes(tag.id)
      ),
    };
  });

  function onCreateNote({ tags, ...data }) {
    setNotes((prevNotes) => {
      return [
        ...prevNotes,
        { ...data, id: uuidV4(), tags: tags.map((tag) => tag.id) },
      ];
    });
    connect('post', 'notes', {
      ...data,
      id: uuidV4(),
      tags: tags.map((tag) => tag.id),
    });
  }

  function onUpdateNote(id, { tags, ...data }) {
    setNotes((prevNotes) => {
      return prevNotes.map((note) => {
        if (note.id === id) {
          return { ...note, ...data, tags: tags.map((tag) => tag.id) };
        } else {
          return note;
        }
      });
    });
    connect('put', 'notes', {
      ...data,
      id: id,
      tags: tags.map((tag) => tag.id),
    });
  }

  function onDeleteNote(id) {
    console.log(id);
    setNotes((prevNotes) => {
      return prevNotes.filter((note) => note.id !== id);
    });
    connect('delete', `notes?note_id=${id}`);
  }

  function addTag(tag) {
    setTags((prev) => [...prev, tag]);
    connect('post', 'tags', tag);
  }

  function updateTag(id, label) {
    setTags((prevTags) => {
      return prevTags.map((tag) => {
        if (tag.id === id) {
          return { ...tag, label };
        } else {
          return tag;
        }
      });
    });
  }

  function deleteTag(id) {
    //todo: тут бага
    var data = connect('delete', `tags?tag_id=${id}`);
    if (data != 'ERROR') {
      setTags((prevTags) => {
        return prevTags.filter((tag) => tag.id !== id);
      });
    }
  }

  return (
    <Container className="my-4">
      <Routes>
        <Route
          path="/"
          element={
            <RequireToken>
              <NoteList
                notes={notesWithTags}
                availableTags={tags}
                onUpdateTag={updateTag}
                onDeleteTag={deleteTag}
              />
            </RequireToken>
          }
        />
        <Route path="/login" element={<Auth />} />
        <Route
          path="/new"
          element={
            <NewNote
              onSubmit={onCreateNote}
              onAddTag={addTag}
              availableTags={tags}
            />
          }
        />
        <Route path="/:id" element={<NoteLayout notes={notesWithTags} />}>
          <Route
            index
            element={<Note onDelete={onDeleteNote} onUpdate={onUpdateNote} />}
          />
          <Route
            path="edit"
            element={
              <EditNote
                onSubmit={onUpdateNote}
                onAddTag={addTag}
                availableTags={tags}
              />
            }
          />
        </Route>
        <Route
          path="profile"
          element={
            <RequireToken>
              <Profile user={user} notes={notesWithTags} />
            </RequireToken>
          }
        />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Container>
  );
}

export default App;
