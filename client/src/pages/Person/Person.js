import React, {useEffect, useState} from "react";
import {useParams, useRouteMatch} from "react-router-dom";
import Card from "react-bootstrap/Card";
import Col from "react-bootstrap/Col";
import Row from "react-bootstrap/Row";
import {Alert, Button, ListGroup} from "react-bootstrap";
import Badge from "react-bootstrap/Badge";
import {useAuthContext} from "../../context/AuthContext";

export default function Person() {
    const {url} = useRouteMatch();
    const {personID} = useParams();
    const [person, setPerson] = useState(null);
    const [movies, setMovies] = useState(null);
    const [collabs, setCollabs] = useState(null);

    const [followSuccess, setFollowSuccess] = useState();
    const [followError, setFollowError] = useState();
    const [show, setShow] = useState(false);

    const {authState} = useAuthContext();

    useEffect(() => {
        fetch('/api/' + url, {
            method: "GET",
            credentials: 'include',
        }).then(res => res.json())
            .then(data => {
                setPerson(data.Person[0]);
                setMovies(data.Movies);
                setCollabs(data.common_collabs);
            })
            .catch(error => console.log(error));
    }, [url]);

    function handleFollow(action) {
        fetch('/api/' + url, {
            method: "POST",
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                follower: authState.userInfo._id,
                following: personID,
                action: action
            })
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            return res.json();
        }).then(data => {
                setFollowSuccess(data.message);
            }
        ).catch(error => {
            error.json();
            setFollowError(error.message);
        });
        setFollowSuccess(null);
        setFollowError(null);
        setShow(true);
        setTimeout(() => {
            setShow(false);
            window.location.reload();
        }, 2000);
    }

    return (
        <div>
            {!!person && <div className="profile"
                              style={{display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                <p className="display-3">{person.Name}</p>

                {(!!authState.userInfo && Object.entries(authState.userInfo).length !== 0) &&
                <>
                    {authState.userInfo.people_following.includes(personID) ?
                        <>
                            <Button variant="outline-danger" onClick={() => handleFollow('unfollow')}>Unfollow</Button>
                        </> :
                        <>
                            <Button onClick={() => handleFollow('follow')}>Follow</Button>
                        </>
                    }
                </>
                }
                <Row style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                    {followError && show && (
                        <Alert variant={'danger'}>{followError}</Alert>
                    )}
                    {followSuccess && show && (
                        <Alert variant={'success'}>{followSuccess}</Alert>
                    )}
                </Row>
            </div>}
            <Row>
                <Col>
                    <h4>Work</h4>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        justifyContent: 'space-evenly',
                        alignItems: 'stretch'
                    }}>
                        {!!movies && movies.map(movie =>
                            <Card style={{width: '12rem', padding: "0 1 1 1"}} key={movie._id}>
                                <Card.Img variant={'top'}
                                          src={movie.Poster}/>
                                <Card.Body>
                                    <Card.Link href={'/movies/' + movie._id} style={{'textDecoration': 'none'}}>
                                        <Card.Title>{movie.Title}</Card.Title>
                                    </Card.Link>
                                    <Card.Subtitle className="mb-2 text-muted">{movie.Year}</Card.Subtitle>
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                </Col>
                <Col>
                    <h4>Common Collaborators</h4>
                    <ListGroup>
                        {!!collabs && collabs.map(p =>
                            <ListGroup.Item variant={'light'} action
                                            className={'px-2'}
                                            href={"/people/" + p._id._id}
                                            key={p._id._id}
                                            style={{paddingTop: '10px', flexWrap: 'wrap'}}>
                                {p._id.Name} <Badge variant={'light'}>{p.count}</Badge>
                            </ListGroup.Item>
                        )}
                    </ListGroup>
                </Col>
            </Row>
        </div>
    )

}