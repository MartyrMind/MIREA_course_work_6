import React, { useState } from 'react';
import { Button, Card, Col, Form, Row } from 'react-bootstrap';
import { useNavigate } from 'react-router';
import { setToken } from './Auth';
import axios from 'axios';
export function Auth() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    password: '',
    password2: '',
  });
  const { email, name, password, password2 } = formData;
  const [isLogin, setIsLogin] = useState(true);
  const handleToggle = () => {
    setIsLogin((prev) => !prev);
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    var body = {};
    var handler = '';
    var headers = {};
    if (isLogin) {
      body = new FormData();
      body.append('username', formData.name);
      body.append('password', formData.password);
      handler = 'login';
      headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      body = {
        login: formData.name,
        password: formData.password,
        email: formData.email,
      };
      handler = 'register';
      headers = { 'Content-Type': 'application/json' };
    }
    // var backend_address = process.env.REACT_APP_EXTERNAL_IP;
    // if (typeof backend_address === 'undefined') backend_address = 'localhost';
    // console.log(backend_address);
    const backend_address = '51.250.0.94';
    axios({
      method: 'post',
      url: `http://${backend_address}:8000/${handler}`,
      data: body,
      headers: headers,
    })
      .then(function (response) {
        if (response.data.access_token) {
          console.log(response);
          setToken(response.data.access_token);
          navigate('/');
        }
      })
      .catch(function (error) {
        console.log(error, 'error');
      });
  };
  return (
    <Row className="justify-content-center">
      <Col xs={10} md={4}>
        <Card className="my-5 px-5 py-3">
          <h1 className="m-3 text-center">Sign {isLogin ? 'In' : 'Up'}</h1>
          {!isLogin && (
            <Form.Group className="my-2">
              <Form.Label>EmailAddress</Form.Label>
              <Form.Control
                type="email"
                placeholder="enter email"
                name="email"
                value={email}
                onChange={handleChange}
              />
            </Form.Group>
          )}
          <Form.Group className="my-2">
            <Form.Label>Username</Form.Label>
            <Form.Control
              type="name"
              placeholder="enter name"
              value={name}
              name="name"
              onChange={handleChange}
            />
          </Form.Group>

          <Form.Group className="my-2">
            <Form.Label>Password</Form.Label>
            <Form.Control
              type="password"
              placeholder="enter password"
              value={password}
              name="password"
              onChange={handleChange}
            />
          </Form.Group>
          {!isLogin && (
            <Form.Group className="my-2">
              <Form.Label>Confirm Password</Form.Label>
              <Form.Control
                type="password"
                placeholder="enter password again"
                value={password2}
                name="password2"
                onChange={handleChange}
              />
            </Form.Group>
          )}
          <div className="mt-3 text-center">
            <p>
              {isLogin ? "Don't" : 'Already'} have an account ?{' '}
              <Button
                size="sm"
                variant="outline-primary"
                onClick={handleToggle}
              >
                Sign {isLogin ? 'Up' : 'In'}
              </Button>
            </p>
            <Button
              className="btn btn-block"
              type="submit"
              onClick={handleSubmit}
            >
              Sign {isLogin ? 'In' : 'Up'}
            </Button>
          </div>
        </Card>
      </Col>
    </Row>
  );
}
