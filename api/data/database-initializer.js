// Required libraries to initialize the database
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let db;

// Parse the static json file to load our existing movies
let movies = require('./movie-data.json');

// Connect MongoClient to local database url
MongoClient.connect("mongodb://localhost:27017/", function (err, client) {
    if (err) throw err; //Throw error

    // Create/Connect to the mongo db instance
    db = client.db('movie-database');

    // Get the existing collections (if any) of the initialized database
    db.listCollections().toArray( function (err, result) {

        // If collection is empty create a new movies collection
        if (result.length == 0) {
            initDB(client);
            return;
        }

        let numDropped = 0;
        let toDrop = result.length;

        // For each existing collection inside the database drop them and once
        // all of them have been dropped, create a new movies collection
        result.forEach(collection => {
            db.collection(collection.name).drop(function (err, delOK) {
                if (err) throw err;

                console.log("Dropped collection of " + collection.name);
                numDropped++;

                if (numDropped === toDrop) {
                    initDB(client);
                    return;
                }
            });
        });
    });
});

// Create a movies collection using the parsed JSON data stored locally
function initDB(client) {
    db = client.db('movie-database');
    db.collection("movies").insertMany(movies, function (err, result) {
        if (err) throw err;
        console.log('\x1b[36m%s\x1b[0m', "Successfuly inserted " + result.insertedCount + " movies into the database.")
        process.exit();
    });
}