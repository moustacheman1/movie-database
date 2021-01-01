import React, {useEffect, useState} from "react";
import {Button, Form, FormControl, InputGroup, Pagination, ToggleButton, ToggleButtonGroup} from "react-bootstrap";
import {Handles, Rail, Slider, Tracks} from "react-compound-slider";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import {Search} from "react-bootstrap-icons";
import Card from "react-bootstrap/Card";
import {useHistory, useLocation} from "react-router";

export function Handle({handle: {id, value, percent}, getHandleProps}) {
    return (
        <div
            style={{
                left: `${percent}%`,
                position: 'absolute',
                marginLeft: -15,
                marginTop: 25,
                zIndex: 2,
                width: 30,
                height: 30,
                border: 0,
                textAlign: 'center',
                cursor: 'pointer',
                borderRadius: '50%',
                backgroundColor: '#2C4870',
                color: '#333',
            }}
            {...getHandleProps(id)}
        >
            <div style={{fontSize: 14, marginTop: -30}}>
                {value}
            </div>
        </div>
    )
}

export function Track({source, target, getTrackProps}) {
    return (
        <div
            style={{
                position: 'absolute',
                height: 10,
                zIndex: 1,
                marginTop: 35,
                backgroundColor: '#546C91',
                borderRadius: 5,
                cursor: 'pointer',
                left: `${source.percent}%`,
                width: `${target.percent - source.percent}%`,
            }}
            {...getTrackProps() /* this will set up events if you want it to be clickeable (optional) */}
        />
    )
}

function useQuery() {
    return new URLSearchParams(useLocation().search);
}

export default function Movies() {
    const [title, setTitle] = useState("");
    const [genre, setGenre] = useState([]);
    const [yearMin, setYearMin] = useState(1900);
    const [yearMax, setYearMax] = useState(2020);
    const [minRating, setMinRating] = useState(0);
    const [maxRating, setMaxRating] = useState(10)

    const [movies, setMovies] = useState(null);
    const [pageNumber, setPageNumber] = useState(1);
    const history = useHistory();

    const genres = ['Action', 'Adventure', 'Animation', 'Biography',
        'Comedy', 'Crime', 'Documentary', 'Drama', 'Family', 'Fantasy',
        'Film-Noir', 'History', 'Horror', 'Music', 'Musical', 'Mystery' , 'News',
        'Romance', 'Sci-Fi', 'Short', 'Sport', 'Thriller', 'War', 'Western'];

    const sliderStyle = {
        position: 'relative',
        width: '100%',
        height: 20,
    };
    const railStyle = {
        position: 'absolute',
        width: '100%',
        height: 10,
        marginTop: 35,
        borderRadius: 5,
        backgroundColor: '#ffffff',
    }

    const queryGenre = useQuery().get("Genre");

    const handleTitleChange = val => setTitle(val);
    const handleGenreChange = val => setGenre(val);
    const handleYearChange = val => {
        setYearMin(val[0]);
        setYearMax(val[1]);
    }
    const handleRatingChange = val => {
        setMinRating(val[0]);
        setMaxRating(val[1]);
    }

    function submitSearch() {
        console.log(title);
        console.log(genre);
        console.log(yearMin, yearMax);
        console.log(minRating, maxRating);

        let query = {};
        if (!!title) {
            query.Title = title;
        }
        if (genre && genre.length > 0) {
            query.Genre = genre.join("&Genre=");
        }
        query.YearMin = yearMin;
        query.YearMax = yearMax;
        query.MinRating = minRating;
        query.MaxRating = maxRating;
        query.page = pageNumber;

        let finalQuery = "";
        Object.keys(query).forEach(key => {
            finalQuery += '&' + key + '=' + query[key];
        });
        if (finalQuery.charAt(0) === '&') {
            finalQuery = finalQuery.substring(1);
        }
        let url = "/api/movies?" + finalQuery;

        history.push('/movies');

        fetch(url, {
            method: "GET",
            credentials: "include"
        }).then(res => {
            if (!res.ok) {
                throw res;
            }
            return res.json()
        })
            .then(data => setMovies(data))
            .catch(error => console.log(error));
    }

    useEffect(() => {
        if (queryGenre) {
            genre.push(queryGenre);
            setGenre(genre);
            submitSearch();
        }
    }, [queryGenre]);

    function pageChanged(e) {
    }

    return (
        <div>
            <InputGroup className={'mb-3'}>
                <InputGroup.Prepend>
                    <InputGroup.Text id="title">Title</InputGroup.Text>
                </InputGroup.Prepend>
                <FormControl onChange={e => handleTitleChange(e.target.value)}/>
            </InputGroup>
            <Form.Label style={{fontSize: 20}}>Genre</Form.Label>
            <ToggleButtonGroup type="checkbox" value={genre} vertical={false}
                               style={{flexWrap: 'wrap'}} onChange={handleGenreChange}>
                {genres.map(g => <ToggleButton variant="light" value={g}>{g}</ToggleButton>)}
            </ToggleButtonGroup>
            <br/>
            <br/>
            <Row>
                <Col xs lg="1" style={{
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    fontSize: 20
                }}><Form.Label>Year</Form.Label></Col>
                <Col>
                    <Slider rootStyle={sliderStyle} domain={[1900, 2020]}
                            values={[1900, 2020]} step={1} mode={2} onChange={handleYearChange}>
                        <Rail>
                            {({getRailProps}) => (
                                <div style={railStyle} {...getRailProps()} />
                            )}
                        </Rail>
                        <Handles>
                            {({handles, getHandleProps}) => (
                                <div className="slider-handles">
                                    {handles.map(handle => (
                                        <Handle
                                            key={handle.id}
                                            handle={handle}
                                            getHandleProps={getHandleProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Handles>
                        <Tracks left={false} right={false}>
                            {({tracks, getTrackProps}) => (
                                <div className="slider-tracks">
                                    {tracks.map(({id, source, target}) => (
                                        <Track
                                            key={id}
                                            source={source}
                                            target={target}
                                            getTrackProps={getTrackProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Tracks>
                    </Slider>
                </Col>
            </Row>
            <Row>
                <Col xs lg="1" style={{
                    paddingTop: '20px',
                    paddingBottom: '20px',
                    fontSize: 20
                }}><Form.Label>Rating</Form.Label></Col>
                <Col>
                    <Slider rootStyle={sliderStyle} domain={[0, 10]} values={[0, 10]} step={0.25}
                            onChange={handleRatingChange}>
                        <Rail>
                            {({getRailProps}) => (
                                <div style={railStyle} {...getRailProps()} />
                            )}
                        </Rail>
                        <Handles>
                            {({handles, getHandleProps}) => (
                                <div className="slider-handles">
                                    {handles.map(handle => (
                                        <Handle
                                            key={handle.id}
                                            handle={handle}
                                            getHandleProps={getHandleProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Handles>
                        <Tracks left={false} right={false}>
                            {({tracks, getTrackProps}) => (
                                <div className="slider-tracks">
                                    {tracks.map(({id, source, target}) => (
                                        <Track
                                            key={id}
                                            source={source}
                                            target={target}
                                            getTrackProps={getTrackProps}
                                        />
                                    ))}
                                </div>
                            )}
                        </Tracks>
                    </Slider>
                </Col>
            </Row>
            <Row style={{display: 'flex', justifyContent: 'center'}}>
                <Button variant="outline-success" onClick={submitSearch}
                        style={{display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                    <Search/>&nbsp;  Search</Button>
            </Row>
            <br/>
            <div style={{display: 'flex', flexWrap: 'wrap', alignContent: 'flex-start', justifyContent: 'space-evenly', alignItems: 'stretch'}}>
                {!!movies && movies.map(movie =>
                    <Card style={{width: '12rem', padding: "0 1 1 1"}}>
                        <Card.Img class="card-img-top" variant={'top'}
                                  src={movie.Poster}/>
                        <Card.Body>
                            <Card.Link href={'/movies/' + movie._id} style={{'text-decoration': 'none'}}>
                                <Card.Title>{movie.Title}</Card.Title>
                            </Card.Link>
                            <Card.Subtitle className="mb-2 text-muted">{movie.Year}</Card.Subtitle>
                            <Card.Text className={'text-left'} style={{fontSize: 14}}>{movie.Plot}</Card.Text>
                        </Card.Body>
                    </Card>
                )}
            </div>
            <br/>
            {!!movies && <Pagination size={"lg"} onClick={() => setPageNumber(pageChanged)} style={{display: 'flex', justifyContent: 'center'}}>
                <Pagination.First/>
                <Pagination.Prev/>
            </Pagination>}
        </div>
    )
}