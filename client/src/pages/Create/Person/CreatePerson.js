import React, {useState} from "react";
import {Alert, Button, FormControl, InputGroup} from "react-bootstrap";
import {Plus} from "react-bootstrap-icons";

export default function CreatePerson() {
    const [name, setName] = useState("");
    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [show, setShow] = useState(false);

    const handleNameChange = val => setName(val);

    function submitSearch() {
        fetch('/api/people', {
            method: 'POST',
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                person_name: name
            })
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            console.log(res);
            setShow(true);
            return res.json();
        }).then(data => {
            console.log(data);
            setSuccessMessage(data.message)
            setName("");
        })
            .catch(error => {
                console.log(error);
                error.json();

                if (error.status === 403) {
                    setErrorMessage("You are not authorized to do that.");
                } else {
                    setErrorMessage("Could not add " + name + "." );
                }
                setShow(true);
            });

        setSuccessMessage("");
        setErrorMessage("");
        setTimeout(() => {
            setShow(false);
        }, 2000);
    }

    return (
        <div>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id='name'>Name</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl value={name}
                    onChange={e => handleNameChange(e.target.value)}/>
            </InputGroup>
            <br/>
            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                {errorMessage && show && (
                    <Alert variant={'danger'}>{errorMessage}</Alert>
                )}
                {successMessage && show && (
                    <Alert variant={'success'}>{successMessage}</Alert>
                )}
            </div>
            <br/>
            <Button variant="outline-success" onClick={submitSearch}
                    style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Plus/>&nbsp;Add Person</Button>
        </div>
    )
}