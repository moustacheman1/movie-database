import React from "react";
import Home from "./pages/Home/Home";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import {Route} from "react-router-dom";
import {Switch} from "react-router";
import Profile from "./pages/Profile/Profile";
import Movies from "./pages/Movies/Movies";
import Movie from "./pages/Movie/Movie";
import People from "./pages/People/People";
import Person from "./pages/Person/Person";
import Users from "./pages/Users/Users";
import User from "./pages/User/User";
import Create from "./pages/Create/Create";
import CreatePerson from "./pages/Create/Person/CreatePerson";
import CreateMovie from "./pages/Create/Movie/CreateMovie";
import Notification from "./pages/Notification/Notification";


export default function Routes() {
    return (
        <Switch>
            <Route exact path="/">
                <Home/>
            </Route>
            <Route exact path="/login">
                <Login/>
            </Route>
            <Route exact path="/register">
                <Register/>
            </Route>
            <Route exact path="/profile">
                <Profile/>
            </Route>
            <Route exact path="/notifications">
                <Notification/>
            </Route>
            <Route exact path="/movies">
                <Movies/>
            </Route>
            <Route path="/movies/:movieID">
                <Movie/>
            </Route>
            <Route exact path="/people">
                <People/>
            </Route>
            <Route path="/people/:personID">
                <Person/>
            </Route>
            <Route exact path="/users">
                <Users/>
            </Route>
            <Route path="/users/:userID">
                <User/>
            </Route>
            <Route exact path="/create">
                <Create/>
            </Route>
            <Route exact path="/create/person">
                <CreatePerson/>
            </Route>
            <Route exact path="/create/movie">
                <CreateMovie/>
            </Route>
        </Switch>
    )
}