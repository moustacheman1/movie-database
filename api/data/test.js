let movies = require('./movie-data.json');

let distinctlist = {};

movies.forEach(movie => {
    if (!distinctlist.hasOwnProperty(movie.Rated)) {
        distinctlist[movie.Rated] = 1;
    } else {
        distinctlist[movie.Rated] = ++distinctlist[movie.Rated];
    }
});

// function sortObjectByKeys(o) {
//     return Object.keys(o).sort().reduce((r, k) => (r[k] = o[k], r), {});
// }



console.log(distinctlist);
