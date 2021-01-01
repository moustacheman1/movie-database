import React, {useEffect, useState} from "react";
import {useParams, useRouteMatch} from "react-router";
import Card from "react-bootstrap/Card";
import {Alert, Button} from "react-bootstrap";
import {StarFill} from "react-bootstrap-icons";
import Linebreak from "../../components/Linebreak";
import {useAuthContext} from "../../context/AuthContext";
import Row from "react-bootstrap/Row";

export default function User() {
    const {url} = useRouteMatch();
    const {userID} = useParams();
    const [user, setUser] = useState(null);
    const [contributing, setContributing] = useState(false);
    const [reviews, setReviews] = useState(null);

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
                console.log(data);
                setUser(data.User);
                setContributing(data.User.contributing);
                setReviews(data.Reviews);
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
                following: userID,
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
            {!!user && <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-evenly'}}>
                <p className="display-3">{user.username}</p>
                {contributing && <h3 className="mb-2 text-muted"><em>Contributing</em></h3>}
                {!contributing && <h3 className="mb-2 text-muted"><em>Normal</em></h3>}

                {(!!authState.userInfo && Object.entries(authState.userInfo).length !== 0) && authState.userInfo._id !== userID &&
                <>
                    {authState.userInfo.users_following.includes(userID) ?
                        <>
                            <Button variant="outline-primary" onClick={() => handleFollow('unfollow')}>Unfollow</Button>
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
            <Linebreak/>
            <h4>Reviews</h4>
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
        </div>
    )
}