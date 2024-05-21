import { Button, Col, Form, Row, Stack, Image } from 'react-bootstrap';
import { useEffect, useState, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { NoteCard } from './NoteCard';
import { connectBackend } from './connectStorage';
import axios from 'axios';
export function Profile({ user, notes }) {
  const [photoFile, setFile] = useState('');
  const emailRef = useRef(null);
  const newPasswordRef = useRef(null);

  const navigate = useNavigate();

  var notes_by_views = notes.sort((a, b) => b.views - a.views);
  notes_by_views = notes_by_views.slice(0, 3);
  var notes_by_date = notes.sort((a, b) => b.last_visited - a.last_visited);
  notes_by_date = notes_by_date.slice(0, 3);

  useEffect(() => {
    const getData = (endpoint, setter) => {
      connectBackend(endpoint, 'get', {}, 'application/json', setter);
    };
    getData('users/image', setFile);
  }, []);

  const handlePhotoChange = (e) => {
    e.preventDefault();
    setFile(e.target.files[0]);
    console.log(photoFile);
  };

  const handlePhotoSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('file', photoFile);
    connectBackend('users/image', 'put', formData, 'multipart/form-data', null);
  };

  const handleClick = (e) => {
    e.preventDefault();
    localStorage.removeItem('token');
    navigate(0);
  };

  const handleProfileSubmit = (e) => {
    e.preventDefault();
    user.email = emailRef.current.value;
    user.password = newPasswordRef.current.value;
    connectBackend('users', 'put', user, 'application/json', null);
  };

  return (
    <>
      <h1>Welcome, {user.login}!</h1>
      <Row className=" mb-4" md={4}>
        <Col xs={6} md={4}>
          <Stack gap={3} direction="vertical">
            <Image src={`data:image/jpeg;base64,${photoFile}`} rounded />
            <Form onSubmit={handlePhotoSubmit}>
              <Form.Label>Сhange Photo</Form.Label>
              <Form.Control
                type="file"
                placeholder="Search Notes"
                onChange={handlePhotoChange}
              />
              <Button type="submit" variant="primary">
                Save Image
              </Button>
            </Form>
          </Stack>
        </Col>
        <Col>
          <Form onSubmit={handleProfileSubmit}>
            <Stack gap={2}>
              <Form.Group controlId="email">
                <Form.Label>Change Email</Form.Label>
                <Form.Control
                  type="email"
                  ref={emailRef}
                  defaultValue={user.email}
                />
              </Form.Group>
              <Form.Group controlId="password">
                <Form.Label>Change password</Form.Label>
                <Form.Control ref={newPasswordRef} type="password" />
              </Form.Group>
              <Stack
                direction="horizontal"
                gap={2}
                className="justify-content-end"
              >
                <Button type="submit" variant="primary">
                  Save Changes
                </Button>
                <Link to="..">
                  <Button
                    type="button"
                    variant="outline-danger"
                    onClick={handleClick}
                  >
                    Logout
                  </Button>
                </Link>
              </Stack>
            </Stack>
          </Form>
        </Col>
      </Row>
      <h2>Opened recently</h2>
      <Row xs={1} sm={2} lg={3} xl={4} className="m-3">
        {notes_by_date.map((note) => (
          <Col key={note.id}>
            <NoteCard id={note.id} title={note.title} tags={note.tags} />
          </Col>
        ))}
      </Row>
      <h2>Most viewed</h2>
      <Row xs={1} sm={2} lg={3} xl={4} className="m-3">
        {notes_by_views.map((note) => (
          <Col key={note.id}>
            <NoteCard id={note.id} title={note.title} tags={note.tags} />
          </Col>
        ))}
      </Row>
    </>
  );
}
