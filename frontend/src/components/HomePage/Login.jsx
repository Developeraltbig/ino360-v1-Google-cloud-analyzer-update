import React, { useState, useEffect } from "react";
import "../../assets/css/login.css";
import axios from "axios";
import { Modal, Button, FloatingLabel, Form } from "react-bootstrap";
import styled from "styled-components";
import { Link, useNavigate } from "react-router-dom";
import { useToast } from "../../context/ToastContext";

export default function Login() {
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const { showSuccess, showError } = useToast();
  const [modalShow, setModalShow] = useState(false);
  const [loginEmail, setLoginEmail] = useState("");
  const [loginPassword, setLoginPassword] = useState("");
  const [loginErrorMessage, setLoginErrorMessage] = useState("");

  // Check if user is already logged in
  useEffect(() => {
    const user = localStorage.getItem("user");
    if (user) {
      navigate("/homeTwo"); // Redirect to home or dashboard page if logged in
    }
  }, [navigate]);

  const handleRegisterSubmit = async (e) => {
    e.preventDefault();
  
    setErrorMessage(""); // Clear previous error messages
  
    if (!name || !email || !password) {
      setErrorMessage("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await axios.post("/register", {
        name,
        email,
        password,
      });
      showSuccess("User registered successfully!"); // Changed from alert to showSuccess
      const { user } = response.data;
      localStorage.setItem("user", JSON.stringify(user)); // Save user info only
      navigate("/homeTwo");
    } catch (error) {
      if (error.response) {
        setErrorMessage(error.response.data.message);
      } else {
        setErrorMessage("An error occurred, please try again later.");
      }
    }
  };
  
  const handleLoginSubmit = async (e) => {
    e.preventDefault();
  
    setLoginErrorMessage(""); // Clear previous login error messages
  
    if (!loginEmail || !loginPassword) {
      setLoginErrorMessage("Please fill in all fields.");
      return;
    }
  
    try {
      const response = await axios.post("/login", {
        email: loginEmail,
        password: loginPassword,
      });
  
      if (response.status === 200) {
        showSuccess("Login successful!"); // Changed from alert to showSuccess
        const { user } = response.data;
        localStorage.setItem("user", JSON.stringify(user)); // Save user info only
        navigate("/homeTwo");
      }
    } catch (error) {
      if (error.response) {
        setLoginErrorMessage(error.response.data.message);
      } else {
        setLoginErrorMessage("An error occurred, please try again later.");
      }
    }
  };

  return (
    <>
      <Form className="login-form-1" onSubmit={handleRegisterSubmit}>
        <h3 className="login-heading text-left">Create new Account</h3>
        <a className="div-p1 text-left" onClick={() => setModalShow(true)}>
          <span style={{ color: "#000" }}>Already Registered? Log in </span>
          <span style={{ color: "#44B9FF", borderBottom: "1px solid #44B9FF" }}>
            here
          </span>
        </a>

        {errorMessage && (
          <div className="alert alert-danger" role="alert">
            {errorMessage}
          </div>
        )}

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <input
            type="text"
            className="form-control form-input-stl-1"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicEmail">
          <input
            type="email"
            className="form-control form-input-stl-1"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </Form.Group>

        <Form.Group className="mb-3" controlId="formBasicPassword">
          <input
            type="password"
            className="form-control form-input-stl-1"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </Form.Group>

        <a className="div-p" href="#">
          Forgot your password?
        </a>

        <div className="text-center btn-stl-1">
          <Button className="btn-stl" variant="primary" type="submit">
            Sign Up
          </Button>
        </div>
      </Form>

      <MyVerticallyCenteredModal
        show={modalShow}
        onHide={() => setModalShow(false)}
        loginEmail={loginEmail}
        setLoginEmail={setLoginEmail}
        loginPassword={loginPassword}
        setLoginPassword={setLoginPassword}
        handleLoginSubmit={handleLoginSubmit}
        loginErrorMessage={loginErrorMessage}
      />
    </>
  );
}

const StyledModal = styled(Modal)`
  .modal-content {
    border-radius: 20px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    background: #f5f9ff; /* Light blue background as in the image */
  }

  .modal-header {
    border-bottom: none;
    padding: 20px;
  }

  .modal-title {
    font-size: 24px;
    font-weight: bold;
    color: #333;
  }

  .modal-body {
    padding: 20px;
  }

  .modal-footer {
    border-top: none;
    padding: 10px 20px 20px;
    justify-content: center;
  }
`;

const StyledFormControl = styled(Form.Control)`
  border-radius: 10px;
  border: 1px solid #ccc;
  padding: 12px;
  margin-bottom: 15px;
  font-size: 16px;
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);

  &:focus {
    border-color: #007bff;
    box-shadow: 0 0 5px rgba(0, 123, 255, 0.3);
    outline: none;
  }
`;

const SignupButton = styled(Button)`
  background-color: #007bff;
  border: none;
  border-radius: 10px;
  padding: 10px 30px;
  font-size: 16px;
  width: 100%;
  margin-top: 10px;

  &:hover {
    background-color: #0056b3;
  }
`;

const ForgotPassword = styled.p`
  font-size: 14px;
  color: #007bff;
  text-align: center;
  margin-top: 10px;
  cursor: pointer;

  &:hover {
    text-decoration: underline;
  }
`;

const LoginLink = styled.p`
  font-size: 14px;
  color: #666;
  text-align: center;
  margin-top: 10px;

  a {
    color: #007bff;
    text-decoration: none;

    &:hover {
      text-decoration: underline;
    }
  }
`;

// Login Modal Component
export function MyVerticallyCenteredModal(props) {
  const { showSuccess } = useToast();
  return (
    <StyledModal
      {...props}
      size="lg"
      aria-labelledby="contained-modal-title-vcenter"
      centered
    >
      <Modal.Header closeButton>
        <Modal.Title
          id="contained-modal-title-vcenter"
          style={{ color: "#008cbf" }}
        >
          Login
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {props.loginErrorMessage && (
          <div className="alert alert-danger" role="alert">
            {props.loginErrorMessage}
          </div>
        )}

        <FloatingLabel
          controlId="floatingInput"
          label="Email address"
          className="mb-3"
        >
          <StyledFormControl
            type="email"
            placeholder="name@example.com"
            value={props.loginEmail}
            onChange={(e) => props.setLoginEmail(e.target.value)}
          />
        </FloatingLabel>

        <FloatingLabel controlId="floatingPassword" label="Password">
          <StyledFormControl
            type="password"
            placeholder="Password"
            value={props.loginPassword}
            onChange={(e) => props.setLoginPassword(e.target.value)}
          />
        </FloatingLabel>
      </Modal.Body>
      <Modal.Footer>
        <Button
          variant="secondary"
          style={{ width: "100px" }}
          onClick={props.onHide}
        >
          Close
        </Button>
        <Button
          variant="primary"
          style={{ width: "100px", backgroundColor: "#008cbf" }}
          onClick={props.handleLoginSubmit}
        >
          Login
        </Button>
      </Modal.Footer>
    </StyledModal>
  );
}
