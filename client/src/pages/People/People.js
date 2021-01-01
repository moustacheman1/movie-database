import React, {useEffect, useState} from "react";
import {FormControl, InputGroup, ListGroup} from 'react-bootstrap';

export default function People() {
    const [name, setName] = useState("");
    const [people, setPeople] = useState(null);

    const handleNameChange = val => setName(val);

    useEffect(() => {
        fetch('/api/people?Name=' + name, {
            method: "GET",
            credentials: 'include',
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            return res.json()
        })
            .then(data => setPeople(data))
            .catch(error => console.log(error));
    }, [name]);

    return (
        <div>
            <h5>Find Actors, Directors and Writers</h5>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id='name'>Name</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onChange={e => handleNameChange(e.target.value)}/>
            </InputGroup>
            <br/>
            <ListGroup>
                {!!people && people.map(person =>
                    <ListGroup.Item variant={'light'} action
                                    className={'px-2'}
                                    href={"/people/" + person._id}
                                    style={{paddingTop: '10px', flexWrap: 'wrap'}}>{person.Name}</ListGroup.Item>
                )}
            </ListGroup>
        </div>
    )
}