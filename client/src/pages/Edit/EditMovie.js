import React, {useEffect, useState} from "react";
import {Alert, Button, Form} from "react-bootstrap";
import {AsyncTypeahead, Token} from 'react-bootstrap-typeahead';
import {useRouteMatch} from "react-router";

export default function EditMovie(props) {
    const {url} = useRouteMatch();
    const [options, setOptions] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    const [newDirector, setNewDirector] = useState([]);
    const [newWriters, setNewWriters] = useState([]);
    const [newActors, setNewActors] = useState([]);

    const [director, setDirector] = useState([]);
    const [writer, setWriter] = useState([]);
    const [actors, setActors] = useState([]);

    const [show, setShow] = useState(false);
    const [successMessage, setSuccessMessage] = useState();
    const [errorMessage, setErrorMessage] = useState();

    useEffect(() => {
        setDirector(props.director);
        setWriter(props.writers);
        setActors(props.actors);
    }, []);

    const handleSearch = (query) => {
        setIsLoading(true);

        fetch("/api/People?Name=" + query, {
            method: "GET",
            credentials: "include"
        }).then(res => res.json())
            .then(data => {
                const options = data;
                setOptions(options);
                setIsLoading(false);
            })
    }

    function validateForm() {
        return director.length > 0 && writer.length > 0 && actors.length > 0;
    }

    const handleDirectorChange = val => {
        const diff = val.filter(dir => !director.includes(dir))
        setNewDirector(diff);
    }

    const handleWriterChange = val => {
        const diff = val.filter(writ => !writer.includes(writ))
        setNewWriters(diff);
    }

    const handleActorChange = val => {
        const diff = val.filter(act => !actors.includes(act))
        setNewActors(diff);
    }

    function handleSubmit() {
        fetch('/api/' + url, {
            method: 'PATCH',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                    director: newDirector,
                    writers: newWriters,
                    actors: newActors
                }
            )}).then(res => {
            setShow(true);
            if (!res.ok) {
                throw res;
            }
            return res.json();
        })
            .then(data => {
                setSuccessMessage(data.message);
            })
            .catch(error => {
                if (error.status === 400) {
                    setErrorMessage('Couldnt edit movie.');
                } else {
                    setErrorMessage('Oops something went wrong on our end.');
                }
            });
        setTimeout(() => {
            setShow(false);
        }, 2000);
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>
                <Form.Group style={{marginTop: '20px'}}>
                    <Form.Label>Director(s)</Form.Label>
                    <AsyncTypeahead
                        id="directors"
                        isLoading={isLoading}
                        value={director}
                        labelKey={'Name'}
                        minLength={3}
                        onSearch={handleSearch}
                        options={options}
                        multiple
                        onChange={handleDirectorChange}
                        placeholder="Choose director(s)"
                        defaultSelected={props.director}
                        renderToken={(option) => {
                            return (<Token>{option.Name}</Token>);
                        }}
                    />
                </Form.Group>

                <Form.Group style={{marginTop: '20px'}}>
                    <Form.Label>Writer(s)</Form.Label>
                    <AsyncTypeahead
                        id="writers"
                        isLoading={isLoading}
                        value={writer}
                        labelKey={'Name'}
                        minLength={3}
                        onSearch={handleSearch}
                        options={options}
                        multiple
                        onChange={handleWriterChange}
                        placeholder="Choose writer(s)"
                        defaultSelected={props.writers}
                        renderToken={(option) => {
                            return (<Token>{option.Name}</Token>);
                        }}
                    />
                </Form.Group>

                <Form.Group style={{marginTop: '20px'}}>
                    <Form.Label>Actor(s)</Form.Label>
                    <AsyncTypeahead
                        id="actors"
                        isLoading={isLoading}
                        value={actors}
                        minLength={3}
                        labelKey={'Name'}
                        onSearch={handleSearch}
                        options={options}
                        multiple
                        onChange={handleActorChange}
                        placeholder="Choose actor(s)"
                        defaultSelected={props.actors}
                        renderToken={(option) => {
                            return (<Token>{option.Name}</Token>);
                        }}
                    />
                </Form.Group>

                <Button variant="primary" type={"submit"} disabled={!validateForm()}>
                    Submit
                </Button>
            </Form>

            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                {errorMessage && show && (
                    <Alert variant={'danger'}>{errorMessage}</Alert>
                )}
                {successMessage && show && (
                    <Alert variant={'success'}>{successMessage}</Alert>
                )}
            </div>
        </div>
    )
}