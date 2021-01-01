import React, {useState} from "react";
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button";
import {Alert} from "react-bootstrap";
import {Redirect} from "react-router";
import {useAuthContext} from "../../context/AuthContext";

export default function Register() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [registerError, setRegisterError] = useState("");
    const [show, setShow] = useState(true);
    const [redirectOnRegister, setRedirectOnRegister] = useState(false);
    const { setAuthState } = useAuthContext();

    function validateForm() {
        return username.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();

        fetch("/api/register", {
            method: "POST",
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username: username,
                password: password
            })
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            return res.json();
        }).then(data => {
            setAuthState({
                userInfo: data,
                isAuthenticated: true
            });
            setRedirectOnRegister(true);
        })
            .catch(error => {
            if (error.status === 409) {
                setRegisterError("Username already exists. Please try again");
            } else {
                setRegisterError("Oops! Looks like something went wrong on our end.")
            }
            setUsername("");
            setPassword("");
        });

        setRegisterError(null);
        setShow(true);
    }

    return (
        <div className="login-form">
            {redirectOnRegister && <Redirect to="/profile"/>}
            <Form onSubmit={handleSubmit}>
                <h2>Create new account</h2>
                {registerError && show && (
                    <Alert variant={'danger'} onClose={() => setShow(false)} dismissible>{registerError}</Alert>
                )}
                <Form.Group size="lg">
                    <Form.Control autoFocus className="form-control" type="text" name="username" placeholder="Username"
                                  value={username}
                                  onChange={(e) => setUsername(e.target.value)}/>
                </Form.Group>
                <Form.Group size="lg" controlId="password">
                    <Form.Control className="form-control" type="password" placeholder="Password" value={password}
                                  onChange={(e) => setPassword(e.target.value)}/>
                </Form.Group>
                <Form.Group>
                    <Button variant="dark" block size="lg" type="submit" disabled={!validateForm()}>
                        Register
                    </Button>
                </Form.Group>
            </Form>
            <p className="text-center">
                <a href="/login"> Already have an account?</a>
            </p>
        </div>
    );
}