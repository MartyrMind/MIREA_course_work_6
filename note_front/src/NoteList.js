import { Button, Col, Form, Row, Stack, Modal, Image } from 'react-bootstrap';
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import ReactSelect from 'react-select';
import { NoteCard } from './NoteCard';
import { connectBackend } from './connectStorage';

export function NoteList({ onUpdateTag, onDeleteTag }) {
  const [selectedTags, setSelectedTags] = useState([]);
  const [title, setTitle] = useState('');
  const [editTagsModalIsOpen, setEditTagsModalIsOpen] = useState(false);
  const [photoFile, setFile] = useState('');

  const [notes, setNotes] = useState([]);
  const [availableTags, setTags] = useState([]);

  const tags = availableTags;

  useEffect(() => {
    const getData = (endpoint, setter) => {
      connectBackend(endpoint, 'get', {}, 'application/json', setter);
    };
    getData('notes', setNotes);
    getData('tags', setTags);
    getData('users/image', setFile);
  }, []);

  const notesWithTags = notes.map((note) => {
    return {
      ...note,
      tags: tags.filter((tag) =>
        note.tags.map((tag) => tag.id).includes(tag.id)
      ),
    };
  });

  const filteredNotes = notesWithTags.filter((note) => {
    return (
      (title === '' ||
        note.title.toLowerCase().includes(title.toLowerCase())) &&
      (selectedTags.length === 0 ||
        selectedTags.every((tag) =>
          note.tags.some((noteTag) => noteTag.id === tag.id)
        ))
    );
  });

  return (
    <>
      <Row className="align-items-center mb-4 h-5">
        <Col>
          <h1>Notes</h1>
        </Col>
        <Col className="col-md-3">
          <Stack gap={2} direction="horizontal">
            <Link to="/new">
              <Button variant="primary">Create</Button>
            </Link>
            <Button
              onClick={() => setEditTagsModalIsOpen(true)}
              variant="outline-secondary"
            >
              Edit Tags
            </Button>
            <Link to="/profile">
              <Image
                fluid
                src={`data:image/jpeg;base64,${photoFile}`}
                roundedCircle
              />
            </Link>
          </Stack>
        </Col>
      </Row>
      <Form>
        <Row className="mb-4">
          <Col>
            <Form.Group controlId="title">
              <Form.Label>Title</Form.Label>
              <Form.Control
                type="text"
                placeholder="Search Notes"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col>
            <Form.Group controlId="tags">
              <Form.Label>Tags</Form.Label>
              <ReactSelect
                value={selectedTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                options={availableTags.map((tag) => {
                  return { label: tag.label, value: tag.id };
                })}
                onChange={(tags) => {
                  setSelectedTags(
                    tags.map((tag) => {
                      return { label: tag.label, id: tag.value };
                    })
                  );
                }}
                isMulti
              />
            </Form.Group>
          </Col>
        </Row>
      </Form>
      <Row xs={1} sm={2} lg={3} xl={4} className="g-3">
        {filteredNotes.map((note) => (
          <Col key={note.id}>
            <NoteCard id={note.id} title={note.title} tags={note.tags} />
          </Col>
        ))}
      </Row>
      <EditTagsModal
        show={editTagsModalIsOpen}
        handleClose={() => setEditTagsModalIsOpen(false)}
        availableTags={availableTags}
        onUpdateTag={onUpdateTag}
        onDeleteTag={onDeleteTag}
      />
    </>
  );
}

function EditTagsModal({
  availableTags,
  handleClose,
  show,
  onUpdateTag,
  onDeleteTag,
}) {
  return (
    <Modal show={show} onHide={handleClose}>
      <Modal.Header closeButton>
        <Modal.Title>Edit Tags</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <Form>
          <Stack gap={2}>
            {availableTags.map((tag) => (
              <Row key={tag.id}>
                <Col>
                  <Form.Control
                    type="text"
                    value={tag.label}
                    onChange={(e) => onUpdateTag(tag.id, e.target.value)}
                  />
                </Col>
                <Col xs="auto">
                  <Button
                    onClick={() => onDeleteTag(tag.id)}
                    variant="outline-danger"
                  >
                    &times;
                  </Button>
                </Col>
              </Row>
            ))}
          </Stack>
        </Form>
      </Modal.Body>
    </Modal>
  );
}
