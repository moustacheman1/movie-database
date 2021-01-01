import React, {useEffect, useState} from "react";
import {FormControl, InputGroup, ListGroup} from 'react-bootstrap';

export default function Users() {
    const [username, setUsername] = useState("");
    const [users, setUsers] = useState(null);

    const handleNameChange = val => setUsername(val);

    useEffect(() => {
        fetch('/api/users?Username=' + username, {
            method: "GET",
            credentials: 'include',
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            return res.json()
        })
            .then(data => setUsers(data))
            .catch(error => console.log(error));
    }, [username]);

    return (
        <div>
            <h5>Find Actors, Directors and Writers</h5>
            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text id='username'>Username</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onChange={e => handleNameChange(e.target.value)}/>
            </InputGroup>
            <br/>
            <ListGroup>
                {!!users && users.map(user =>
                    <ListGroup.Item variant={'light'} action
                                    className={'px-2'}
                                    href={"/users/" + user._id}
                                    style={{paddingTop: '10px', flexWrap: 'wrap'}}>{user.username}</ListGroup.Item>
                )}
            </ListGroup>
        </div>
    )
}