## COMP 2406 - Movie Database Project
___ 

#### Setup
##### Api

To run this application you will need the following programs running on your system

```
nodejs (v12+)
npm (v6+)
mongodb
```

Firstly, you will see there are two folders one that says api and one that says client. 
The api folder contains the express middleware where the api is going to be stored and the client contains the REACT 
front-end material made for users to navigate through our website. 

To run the application first navigate to the api folder and run the following commands
```
cd api
npm install
npm run db:init
npm start
``` 
The first npm command will install any dependencies needed for the application, and the second npm command will initialize
the database with movies and people using the provided json file found in `/api/data/movies-data.json`. The database is 
stored on port 27017 in localhost, this command may take a while to run as it uses unique people such that people with the 
same name are all one person regardless of whether they're an actor, writer or director. Lastly the npm start command will
run the backend service on `localhost:9000`. You can navigate it on your webpage and try different api calls to test it out.

i.e. `http://localhost:9000/api/movies`

##### Client

Once the api has been initialized we can start the frontend part of the application which the user can interact with.

Perform the following commands, similarly done in the api setup or follow the README found in the client folder.
```
cd client
npm install
npm start
```

After these commands are performed we can navigate to the http://localhost:3000 to interact with the frontend 
portion of the app. 

#### Walkthrough

There's a lot of shit missing like pagination for movie searching and error handling on the front end but it's mostly done.
Will probably update this in the future but for now it's pretty good.

