import React, {useEffect, useState} from 'react';
import './App.css';
import Navbar from "react-bootstrap/cjs/Navbar";
import Nav from "react-bootstrap/Nav";
import Routes from "./Routes";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import {NavDropdown} from "react-bootstrap";
import {AuthContext} from "./context/AuthContext";
import {useHistory} from "react-router";
import {BellFill} from "react-bootstrap-icons";

function App() {
    const [authState, setAuthState] = useState({
        userInfo: null,
        isAuthenticated: false
    })
    const history = useHistory();

    useEffect(() => {
        fetch("/api/user-info", {
            method: "GET",
            credentials: "include"
        })
            .then(res => {
                if (res.status === 401) {
                    throw res;
                }
                return res.json();
            })
            .then(data => {
                setAuthState({
                        userInfo: data.user,
                        isAuthenticated: true
                    }
                )
            }).catch(err => {
            setAuthState({
                    userInfo: {},
                    isAuthenticated: false
                }
            )
        });
    }, []);

    const setAuthInfo = async ({userInfo}) => {
        console.log('we reached the authinfo func');
        console.log(userInfo);
        setAuthState({
            userInfo,
            isAuthenticated: !!(userInfo && userInfo._id)
        });
    }

    function handleLogout() {
        fetch('/api/logout', {
            method: 'POST',
            credentials: 'include'
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            setAuthState({
                userInfo: {},
                isAuthenticated: false
            });
            return res.json();
        }).then(data => {
                console.log(data.message);
                history.push('/');
            }
        ).catch(error => {
            error.json();
            console.log(error.message);
        });
    }

    return (
        <div className="App container py-3">
            <Navbar collapseOnSelect bg="light" expand="md" className="mb-3">
                <Nav className="mr-auto">
                    <Navbar.Brand href="/" className="font-weight-bold text-muted">
                        Movie Database
                    </Navbar.Brand>
                    <Navbar.Toggle/>
                    <Nav.Link href='/movies'>Movies</Nav.Link>
                    <Nav.Link href='/people'>People</Nav.Link>
                    <Nav.Link href='/users'>Users</Nav.Link>
                    <NavDropdown id={'collapsible-dropdown'} title={'Create'} href={'/create'}>
                        <NavDropdown.Item href='/create/person'>Person</NavDropdown.Item>
                        <NavDropdown.Item href='/create/movie'>Movie</NavDropdown.Item>
                    </NavDropdown>
                </Nav>
                <Nav>
                    {authState.isAuthenticated ? (
                        <>
                            <Nav.Link className="mb-2 text-muted" href="/notifications" style={{textAlign: 'right'}}>
                                <BellFill/>
                            </Nav.Link>
                            <Navbar.Text>
                                Signed in as: <a href='/profile'
                                                 style={{textAlign: 'right'}}>{authState.userInfo.username}</a>
                            </Navbar.Text>
                            <Nav.Link onSelect={handleLogout} href="/" style={{textAlign: 'right'}}>Logout</Nav.Link>
                        </>
                    ) : (
                        <>
                            <Nav.Link href="/register" style={{textAlign: 'right'}}>Register</Nav.Link>
                            <Nav.Link href="/login" style={{textAlign: 'right'}}>Login</Nav.Link>
                        </>
                    )}
                </Nav>
            </Navbar>
            <AuthContext.Provider
                value={{
                    authState,
                    setAuthState: authInfo => setAuthInfo(authInfo)
                }}>
                <Routes/>
            </AuthContext.Provider>
        </div>
    );
}

export default App;
