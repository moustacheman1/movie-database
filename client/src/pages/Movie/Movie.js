import React, {useEffect, useState} from "react";
import {useRouteMatch} from "react-router";
import Col from "react-bootstrap/cjs/Col";
import Row from "react-bootstrap/Row";
import Linebreak from "../../components/Linebreak";
import Card from "react-bootstrap/Card";
import {ClipboardCheck, Clock, PencilFill, PenFill, StarFill, X} from "react-bootstrap-icons";
import {Alert, Button, Dropdown, Form} from "react-bootstrap";
import Collapse from "react-bootstrap/Collapse";
import RangeSlider from 'react-bootstrap-range-slider';
import {useAuthContext} from "../../context/AuthContext";
import EditMovie from "../Edit/EditMovie";
import Badge from "react-bootstrap/Badge";

export default function Movie() {
    const {url} = useRouteMatch();
    const [movie, setMovie] = useState(null);
    const [genres, setGenres] = useState([]);
    const [directors, setDirectors] = useState(null);
    const [writers, setWriters] = useState(null);
    const [actors, setActors] = useState(null);
    const [similarMovies, setSimilarMovies] = useState(null);

    const [showQuickReview, setShowQuickReview] = useState(false);
    const [rating, setRating] = useState(0);
    const [showFullReview, setShowFullReview] = useState(false);
    const [summary, setSummary] = useState("");
    const [reviewText, setReviewText] = useState("");

    const [showReviews, setShowReviews] = useState(false);
    const [reviews, setReviews] = useState([]);
    const [reviewSuccess, setReviewSuccess] = useState();
    const [reviewError, setReviewError] = useState();
    const [show, setShow] = useState(false);

    const [editShow, setEditShow] = useState(false);

    const {authState} = useAuthContext();

    useEffect(() => {
        fetch('/api/' + url, {
            method: "GET",
            credentials: 'include',
        }).then(res => res.json())
            .then(data => {
                console.log(data);
                setMovie(data);
                setGenres(data.Movie.Genre);
                setDirectors(data.Movie.Director);
                setWriters(data.Movie.Writer);
                setActors(data.Movie.Actors);
                setSimilarMovies(data.Similar_Movies);
                setReviews(data.Reviews);
            })
            .catch(error => console.log(error));
    }, [url]);

    function handleOnQuickSelect() {
        setShowReviews(false);
        setShowQuickReview(true);
        setShowFullReview(false);
    }

    function handleOnFullSelect() {
        setShowReviews(false);
        setShowQuickReview(false);
        setShowFullReview(true);
    }

    function handleOnReview() {
        setShowReviews(!showReviews);
        setShowQuickReview(false);
        setShowFullReview(false);
    }

    const handleSummaryChange = val => setSummary(val);
    const handleReviewChange = val => setReviewText(val);

    function handleQuickReview() {
        fetch('/api/' + url, {
            method: "POST",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                Rating: rating
            })
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            setShowQuickReview(false);
            return res.json()
        }).then(data => {
            console.log(data);
            setReviewSuccess(data.message);
        }).catch(error => {
            console.log(error);
            error.json();
            setReviewError(error.message);
        });
        setReviewSuccess(null);
        setReviewError(null);
        setShow(true);
        setTimeout(() => {
            setShow(false);
        }, 2000);
    }

    function handleFullReview() {
        fetch('/api/' + url, {
            method: "POST",
            credentials: "include",
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                Rating: rating,
                Summary: summary,
                Review_Text: reviewText
            })
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            setShowFullReview(false);
            return res.json()
        }).then(data => {
            console.log(data);
            setReviewSuccess(data.message);
        }).catch(error => {
            console.log(error);
            error.json();
            setReviewError(error.message);
        });
        setReviewSuccess(null);
        setReviewError(null);
        setShow(true);
        setTimeout(() => {
            setShow(false);
            window.location.reload();
        }, 2000);
    }

    function validateForm() {
        return summary.length > 0 && reviewText.length > 0;
    }

    return (
        <div>
            {!!movie &&
            <Row style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                <Col xs>
                    <img src={movie.Movie.Poster} alt={movie.Title}/>
                </Col>

                <Col>
                    <h1>{movie.Movie.Title}</h1>
                    <h3>{movie.Movie.Year}</h3>
                    {!!genres && genres.map((genre, i) => [
                        i > 0 && ", ",
                        <div style={{display: 'inline-block'}}>
                            <a href={'/movies?Genre=' + genre}>
                                <h5 className="mb-2 text-muted" key={i}><em>{genre}</em></h5>
                            </a>
                        </div>
                    ])}
                    <h3 style={{display: 'flex', alignItems: 'center'}}><StarFill/>&nbsp;{movie.Movie.imdbRating}</h3>
                    <h4 style={{display: 'flex', alignItems: 'center'}}><Clock/>&nbsp;{movie.Movie.Runtime}</h4>
                    <h3>{movie.Movie.Plot}</h3>

                    <Linebreak color={'black'}/>

                    {!!authState.userInfo && Object.entries(authState.userInfo).length !== 0 &&
                    <div style={{display: 'flex', alignItems: 'center', justifyContent: 'flex-end'}}>
                        <Button
                            variant={editShow ? 'dark' : 'outline-dark'} onClick={() => setEditShow(!editShow)}
                            style={{display: 'flex', alignItems: 'center'}}>
                            {editShow ?
                                <><X/>&nbsp;Cancel</> :
                                <><PencilFill/>&nbsp;Edit Movie</>
                            }
                        </Button>
                    </div>
                    }

                    {editShow ? <> {!!directors && !!writers && !!actors &&
                        <EditMovie director={directors}
                                   writers={writers}
                                   actors={actors}/>
                        }</> :
                        <>
                            <h5 className="mb-2 text-muted">Director:&nbsp;
                                {!!directors && directors.map((director, i) => [
                                    i > 0 && ", ",
                                    <a href={'/people/' + director._id} style={{display: 'inline-block'}}>
                                        <h5>{director.Name}</h5>
                                    </a>
                                ])}
                            </h5>
                            <h5 className="mb-2 text-muted">Writers:&nbsp;
                                {!!writers && writers.map((writer, i) => [
                                    i > 0 && ", ",
                                    <a href={'/people/' + writer._id}
                                       style={{display: 'inline-block', flexWrap: 'wrap'}}>
                                        <h5>{writer.Name}</h5>
                                    </a>
                                ])}
                            </h5>
                            <h5 className="mb-2 text-muted">Cast:&nbsp;
                                {!!actors && actors.map((actor, i) => [
                                    i > 0 && ", ",
                                    <a href={'/people/' + actor._id}
                                       style={{display: 'inline-block', flexWrap: 'wrap'}}>
                                        <h5 key={i}>{actor.Name}</h5>
                                    </a>
                                ])}
                            </h5>
                        </>
                    }
                    <Linebreak/>
                </Col>
            </Row>
            }
            <Row style={{display: 'flex', justifyContent: 'space-evenly'}}>
                {!!authState.userInfo && Object.entries(authState.userInfo).length !== 0 &&
                <Dropdown>
                    <Dropdown.Toggle variant="outline-info"
                                     style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                        <PenFill/>&nbsp;  Add Review</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.Item onClick={handleOnQuickSelect}>Quick</Dropdown.Item>
                        <Dropdown.Item onClick={handleOnFullSelect}>Full</Dropdown.Item>
                    </Dropdown.Menu>
                </Dropdown>
                }
                <Button variant="outline-info" onClick={handleOnReview}
                        style={{display: 'flex', alignItems: 'baseline', justifyContent: 'center'}}>
                    <ClipboardCheck/>&nbsp;  Reviews&nbsp;
                    <Badge variant={'info'}>{reviews.length}</Badge>
                </Button>
            </Row>

            <Row style={{display: "flex", alignItems: "center", justifyContent: "center"}}>
                {reviewError && show && (
                    <Alert variant={'danger'}>{reviewError}</Alert>
                )}
                {reviewSuccess && show && (
                    <Alert variant={'success'}>{reviewSuccess}</Alert>
                )}
            </Row>

            <Collapse in={showQuickReview}>
                <div>
                    <Linebreak/>
                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column sm="4">
                                <h4>Rating</h4>
                            </Form.Label>
                            <Col>
                                <RangeSlider value={rating} min={0} max={10} step={0.1} size='sm'
                                             onChange={e => setRating(e.target.value)}>
                                </RangeSlider>
                            </Col>
                            <Col>
                                <Button variant="outline-success" onClick={handleQuickReview}
                                        style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <X/>&nbsp;  Submit</Button>
                            </Col>
                            <Col>
                                <Button variant="outline-danger" onClick={() => setShowQuickReview(false)}
                                        style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <X/>&nbsp;  Cancel</Button>
                            </Col>
                        </Form.Group>
                    </Form>
                </div>
            </Collapse>

            <Collapse in={showFullReview}>
                <div>
                    <Linebreak/>
                    <Form>
                        <Form.Group as={Row}>
                            <Form.Label column sm="4">
                                <h4>Rating</h4>
                            </Form.Label>
                            <Col>
                                <RangeSlider value={rating} min={0} max={10} step={0.1} size='sm'
                                             onChange={e => setRating(e.target.value)}>
                                </RangeSlider>
                            </Col>
                            <Col>
                                <Button variant="outline-success" onClick={handleFullReview}
                                        disabled={!validateForm()}
                                        style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <X/>&nbsp;  Submit</Button>
                            </Col>
                            <Col>
                                <Button variant="outline-danger" onClick={() => setShowFullReview(false)}
                                        style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                    <X/>&nbsp;  Cancel</Button>
                            </Col>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>Summary</Form.Label>
                            <Form.Control value={summary} type="text"
                                          onChange={e => handleSummaryChange(e.target.value)}
                                          placeholder="Summarize your review"/>
                        </Form.Group>
                        <Form.Group as={Row}>
                            <Form.Label>Review</Form.Label>
                            <Form.Control as="textarea" value={reviewText}
                                          onChange={e => handleReviewChange(e.target.value)}
                                          placeholder="Write your thoughts on the movie..."/>
                        </Form.Group>
                    </Form>
                </div>
            </Collapse>

            <Collapse in={showReviews}>
                <div>
                    <br/>
                    <div style={{
                        display: 'flex',
                        flexWrap: 'wrap',
                        alignContent: 'flex-start',
                        justifyContent: 'space-evenly',
                        alignItems: 'stretch'
                    }}>
                        {!!reviews && reviews.map(review =>
                            <Card style={{width: '12rem', padding: "0 1 1 1"}}>
                                <Card.Body>
                                    <Card.Link href={'/users/' + review.Reviewer._id}
                                               style={{'text-decoration': 'none'}}>
                                        <Card.Title>{review.Reviewer.username}</Card.Title>
                                    </Card.Link>
                                    <Card.Subtitle><StarFill/>&nbsp;{review.Rating}</Card.Subtitle>
                                    <br/>
                                    {!!review.Summary &&
                                    <Card.Subtitle className={'text-left'}
                                                   style={{fontSize: 14}}>{review.Summary}</Card.Subtitle>}
                                    {!!review.Review_Text && <Card.Text>{review.Review_Text}</Card.Text>}
                                </Card.Body>
                            </Card>
                        )}
                    </div>
                </div>
            </Collapse>

            <Linebreak/>
            <h5>Similar Movies</h5>
            <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignContent: 'flex-start',
                justifyContent: 'space-evenly',
                alignItems: 'stretch'
            }}>
                {!!similarMovies && similarMovies.map(movie =>
                    <Card style={{width: '12rem', padding: "0 1 1 1"}}>
                        <Card.Img class="card-img-top" variant={'top'}
                                  src={movie.Poster}/>
                        <Card.Body>
                            <Card.Link href={'/movies/' + movie._id} style={{'text-decoration': 'none'}}>
                                <Card.Title>{movie.Title}</Card.Title>
                            </Card.Link>
                            <Card.Subtitle className="mb-2 text-muted">{movie.Year}</Card.Subtitle>
                        </Card.Body>
                    </Card>
                )}
            </div>
        </div>
    )
}