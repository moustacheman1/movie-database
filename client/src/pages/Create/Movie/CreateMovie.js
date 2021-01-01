import React, {useState} from "react";
import {Alert, Button, Form} from "react-bootstrap";
import {Handles, Rail, Slider, Tracks} from "react-compound-slider";
import {Handle, Track} from "../../Movies/Movies";
import {AsyncTypeahead, Typeahead} from 'react-bootstrap-typeahead';

export default function CreateMovie() {
    const [title, setTitle] = useState("");
    const [genres, setGenres] = useState([]);
    const [year, setYear] = useState(1950);
    const [rated, setRated] = useState("G");
    const [director, setDirector] = useState([]);
    const [writer, setWriter] = useState([]);
    const [actors, setActors] = useState([]);

    const [errorMessage, setErrorMessage] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    const [show, setShow] = useState(false);

    const [isLoading, setIsLoading] = useState(false);
    const [options, setOptions] = useState([]);

    const g = ['Action', 'Adventure', 'Animation', 'Biography',
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
        backgroundColor: '#5a6f8d',
    }

    const handleSearch = (query) => {
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

    const handleYearChange = val => setYear(val);
    const handleTitleChange = val => setTitle(val);
    const handleRatedChange = val => setRated(val);

    function handleSubmit() {
        fetch('/api/movie', {
            method: 'POST',
            credentials: 'include',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify({
                    Title: title,
                    Genre: genres,
                    Year: year[0],
                    Rated: rated,
                    Director: director,
                    Writer: writer,
                    Actors: actors
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
                    setErrorMessage('Couldnt add movie.');
                } else {
                    setErrorMessage('Oops something went wrong on our end.');
                }
            });

        setTimeout(() => {
            setShow(false);
        }, 2000);
    }

    function validateForm() {
        return title.length > 0 && genres.length > 0 && director.length > 0 && writer.length > 0 && actors.length > 0;
    }

    return (
        <div>
            <Form onSubmit={handleSubmit}>

                <Form.Group>
                    <Form.Label>Title</Form.Label>
                    <Form.Control onChange={e => handleTitleChange(e.target.value)}
                                  value={title} type="title" placeholder="Title"/>
                </Form.Group>

                <Form.Group controlId="formBasicRange">
                    <Form.Label>Year</Form.Label>
                    <Slider rootStyle={sliderStyle} domain={[1900, 2020]}
                            values={[1950]} step={1} mode={2} onChange={handleYearChange}>
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
                </Form.Group>
                <br/>

                <Form.Group style={{marginTop: '20px'}}>
                    <Form.Label>Genres</Form.Label>
                    <Typeahead
                        id="genres"
                        value={genres}
                        multiple
                        onChange={setGenres}
                        options={g}
                        placeholder="Choose several genres..."
                    />
                </Form.Group>

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
                        onChange={setDirector}
                        placeholder="Choose director(s)"
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
                        onChange={setWriter}
                        placeholder="Choose writer(s)"
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
                        onChange={setActors}
                        placeholder="Choose actor(s)"
                    />
                </Form.Group>

                <Form.Group controlId="exampleForm.ControlSelect1">
                    <Form.Label>Rating</Form.Label>
                    <Form.Control as="select" value={rated} onChange={e => handleRatedChange(e.target.value)}>
                        <option>G</option>
                        <option>PG</option>
                        <option>PG-13</option>
                        <option>NC-17</option>
                        <option>R</option>
                        <option>Not Rated</option>
                    </Form.Control>
                </Form.Group>

                <Button variant="primary" type='submit' disabled={!validateForm()}>
                    Submit
                </Button>
            </Form>

            <br/>
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