import React from "react";
import {Button} from "react-bootstrap";

export default function Create() {

    return (
        <div style={{display: 'flex', justifyContent: 'space-around', alignItems: 'center'}}>
            <Button size={'lg'} variant={'warning'} href="/create/person">Add Person</Button>
            <Button size={'lg'} variant={'info'} href="/create/movie">Add Movie</Button>
        </div>
    )
}