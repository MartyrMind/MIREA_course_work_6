import { useNote } from './NoteLayout';
import { Button, Col, Form, Row, Stack, Card, Badge } from 'react-bootstrap';
import { Link, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import axios from 'axios';
import { BsFloppy2Fill } from 'react-icons/bs';
import { BsPencilFill } from 'react-icons/bs';
import { BsFillTrashFill } from 'react-icons/bs';
import { BsArrowLeft } from 'react-icons/bs';
export function Note({ onDelete, onUpdate }) {
  const note = useNote();

  const navigate = useNavigate();

  const exportMarkdown = () => {
    const backend_address = '51.250.0.94';
    axios({
      method: 'get',
      url: `http:/${backend_address}:8000/notes/${note.id}/pdf`,
      data: {},
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      },
    }).then((response) => {
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `${note.title}.pdf`);
      link.click();
    });
  };
  return (
    <>
      <Row className="align-items-center mb-4">
        <Col>
          <h1>{note.title}</h1>
          {note.tags.length > 0 && (
            <Stack gap={1} direction="horizontal" className="flex-wrap">
              {note.tags.map((tag) => (
                <Badge className="text-trunkate" key={tag.id}>
                  {tag.label}
                </Badge>
              ))}
            </Stack>
          )}
        </Col>
        <Col xs="auto">
          <Stack gap={2} direction="horizontal">
            <Link to={`/${note.id}/edit`}>
              <Button variant="primary">
                <BsPencilFill />
              </Button>
            </Link>
            <Button
              variant="primary"
              onClick={() => {
                exportMarkdown();
              }}
            >
              <BsFloppy2Fill />
            </Button>
            <Button
              onClick={() => {
                onDelete(note.id);
                navigate('/');
              }}
              variant="outline-danger"
            >
              <BsFillTrashFill />
            </Button>
            <Button
              onClick={() => {
                note.views++;
                note.last_visited = new Date();
                onUpdate(note.id, note);
                navigate('/');
              }}
              variant="outline-secondary"
            >
              <BsArrowLeft />
            </Button>
          </Stack>
        </Col>
      </Row>
      <ReactMarkdown>{note.markdown}</ReactMarkdown>
    </>
  );
}
