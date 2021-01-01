import React, {useEffect, useState} from "react";
import "./Profile.css"
import {Alert, Button, Col, ListGroup, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import Row from "react-bootstrap/Row";
import Linebreak from "../../components/Linebreak";
import {PencilFill, StarFill} from "react-bootstrap-icons";
import Collapse from "react-bootstrap/Collapse";
import Card from "react-bootstrap/Card";

export default function Profile() {
    const [username, setUsername] = useState();
    const [contributing, setContributing] = useState();
    let [favGenres, setFavGenres] = useState();
    const [reviews, setReviews] = useState();

    const [roleError, setRoleError] = useState("");
    const [roleSuccess, setRoleSuccess] = useState("");
    const [genreError, setGenreError] = useState("");
    const [genreSuccess, setGenreSuccess] = useState("");
    const [show, setShow] = useState(false);
    const [open, setOpen] = useState(false);

    const [usersFollowing, setUsersFollowing] = useState();
    const [peopleFollowing, setPeopleFollowing] = useState();

    useEffect(() => {
        fetch("/api/profile", {
            method: "GET",
            credentials: 'include',
        }).then(res => res.json())
            .then(data => {
                setUsername(data.User.username);
                setContributing(data.User.contributing);
                setFavGenres(data.User.favourite_genres);
                setReviews(data.Reviews);
                setUsersFollowing(data.User.users_following);
                setPeopleFollowing(data.User.people_following);
            })
            .catch(error => console.log(error));
    }, []);

    const changeRole = () => {
        fetch("/api/profile", {
            method: "PUT",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
                contributing
            })
        }).then(res => {
            if (!res.ok) { throw res; }
            console.log(res);
            return res.json()
        }).then(data => setRoleSuccess(data.message))
            .catch(error => {
                if (error.status === 400){
                  setRoleError(error.json().message);
                } else {
                    setRoleError("Weird! Something's not right");
                }
            });

        setRoleSuccess(null);
        setRoleError(null);
        setShow(true);
        setTimeout(() => {
            setShow(false);
        }, 2000);
    }

    const handleGenreChange = val => {
        favGenres = val;
        setFavGenres(favGenres);
        fetch("/api/profile", {
            method: "PUT",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                username,
                favGenres
            })
        }).then(res => {
            if (!res.ok) { throw res; }
            console.log(res);
            return res.json()
        }).then(data => setGenreSuccess(data.message))
            .catch(error => {
                if (error.status === 400){
                    setGenreError(error.json().message);
                } else {
                    setGenreError("Weird! Something's not right");
                }
            });
    }

    const handleRoleChange = val => {
        setContributing(val);
        changeRole();
    }

    return (
        <div>
            <h2>Profile</h2>
            <div className="profile">
                <p className="display-3">{username}</p>
            </div>
            <div  style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                <h4 >Role</h4>
                <ToggleButtonGroup onChange={handleRoleChange} name="options" className="mb-2" size="lg" value={contributing}>
                    <ToggleButton value={false} type="radio" variant="outline-primary">Regular</ToggleButton>
                    <ToggleButton value={true} type="radio" variant="outline-primary">Contributing</ToggleButton>
                </ToggleButtonGroup>
            </div>
            <div style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                {roleError && show && (
                    <Alert variant={'danger'}>{roleError}</Alert>
                )}
                {roleSuccess && show && (
                    <Alert variant={'success'}>{roleSuccess}</Alert>
                )}
            </div>

            <Linebreak/>
            <h5>Reviews</h5>
            <div style={{display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', justifyContent: 'space-evenly', alignItems: 'stretch'}}>
                {!!reviews && reviews.map(review =>
                    <Card style={{width: '12rem', padding: "0 1 1 1"}}>
                        <Card.Body>
                            <Card.Link href={'/movies/' + review.Movie._id} style={{'text-decoration': 'none'}}>
                                <Card.Title>{review.Movie.Title}</Card.Title>
                            </Card.Link>
                            <Card.Subtitle><StarFill/>&nbsp;{review.Rating}</Card.Subtitle>
                            {!!review.Summary && <Card.Text className={'text-left'} style={{fontSize: 14}}>{review.Summary}</Card.Text>}
                        </Card.Body>
                    </Card>
                )}
            </div>


            <Linebreak color={'black'}/>
            <Row style={{paddingTop: '30px'}}>
                <Col>
                    <div >
                        <Row style={{alignItems: 'center'}}>
                            <h4>Favourite Genres</h4>
                            <Button variant={'light'} onClick={() => setOpen(!open)}>
                                <PencilFill/>
                            </Button>
                        </Row>
                        <Collapse in={!open} timeout={1000}>
                            <ListGroup>
                                {!!favGenres && favGenres.map(genre =>
                                    <ListGroup.Item variant={'info'} action
                                                    className={'px-2'}
                                                    href={"/movies?Genre=" + genre}
                                                    style={{paddingTop: '10px'}}>{genre}</ListGroup.Item>
                                )}
                            </ListGroup>
                        </Collapse>
                        <Collapse in={open} timeout={1000}>
                            <ToggleButtonGroup type="checkbox" value={favGenres} vertical={true} onChange={handleGenreChange}>
                                <ToggleButton variant="outline-info" value={'Action'}>Action</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Adventure'}>Adventure</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Animation'}>Animation</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Biography'}>Biography</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Comedy'}>Comedy</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Crime'}>Crime</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Documentary'}>Documentary</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Drama'}>Drama</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Family'}>Family</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Fantasy'}>Fantasy</ToggleButton>
                                <ToggleButton variant="outline-info" value={'History'}>History</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Horror'}>Horror</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Music'}>Music</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Mystery'}>Mystery</ToggleButton>
                                <ToggleButton variant="outline-info" value={'News'}>News</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Film-Noir'}>Noir</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Romance'}>Romance</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Sci-Fi'}>Science Fiction</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Short'}>Short</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Sports'}>Sports</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Thriller'}>Thriller</ToggleButton>
                                <ToggleButton variant="outline-info" value={'War'}>War</ToggleButton>
                                <ToggleButton variant="outline-info" value={'Western'}>Western</ToggleButton>
                            </ToggleButtonGroup>
                        </Collapse>
                    </div>
                </Col>
                <Col>
                    <div>
                        <h4>User's Following</h4>
                    </div>
                    <ListGroup>
                        {!!usersFollowing && usersFollowing.map(user =>
                            <ListGroup.Item variant={'warning'} action
                                            className={'px-2'}
                                            href={"/user/" + user._id}
                                            style={{paddingTop: '10px'}}>{user.username}</ListGroup.Item>
                        )}
                    </ListGroup>
                </Col>
                <Col>
                    <div>
                        <h4>People Following</h4>
                    </div>
                    <ListGroup>
                        {!!peopleFollowing && peopleFollowing.map(person =>
                            <ListGroup.Item action
                                            className={'px-2'}
                                            href={"/people/" + person._id}
                                            style={{paddingTop: '10px'}}>{person.Name}</ListGroup.Item>
                        )}
                    </ListGroup>
                </Col>
            </Row>
        </div>
    )
}