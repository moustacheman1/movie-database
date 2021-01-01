import React, {useState} from "react";
import Form from "react-bootstrap/Form"
import Button from "react-bootstrap/Button";
import "./Login.css"
import {Alert} from "react-bootstrap";
import {Redirect} from "react-router";
import {useAuthContext} from "../../context/AuthContext";

export default function Login() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loginError, setLoginError] = useState("");
    const [show, setShow] = useState(true);
    const [redirectOnLogin, setRedirectOnLogin] = useState(false);
    const { setAuthState } = useAuthContext();

    function validateForm() {
        return username.length > 0 && password.length > 0;
    }

    function handleSubmit(event) {
        event.preventDefault();

        fetch("/api/login", {
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
            setRedirectOnLogin(true);
        })
            .catch(error => {
                setShow(true);
                if (error.status === 403) {
                    setLoginError("Login and/or password is invalid. Please try again.");
                } else {
                    setLoginError("Oops! Looks like something went wrong on our end.")
                }
                setUsername("");
                setPassword("");
            });

        setShow(true);
        setLoginError(null);
    }

    return (
        <div className="login-form">
            {redirectOnLogin && <Redirect to="/profile"/>}
            <Form onSubmit={handleSubmit}>
                <h2>Log In</h2>
                {loginError && show && (
                    <Alert variant={'danger'} style={{fontWeight: 'bold'}} onClose={() => setShow(false)}
                           dismissible>{loginError}</Alert>
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
                        Login
                    </Button>
                </Form.Group>
            </Form>
            <p className="text-center">
                Don't have an account?
                <a href="/register"> Register</a>
            </p>
        </div>
    );
}