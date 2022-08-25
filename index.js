const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path'),
bodyParser = require('body-parser'),
uuid = require('uuid');

const app = express();

app.use(bodyParser.json());

let movies = [
{
  "Title": "Amelie",
  "Description": "blabla",
  "Year": 2001,
  "Genre": {
    "Name": "Drama",
    "Description": "blabla"
  },
  "Director": {
    "Name": "Jean-Pierre Jeunet",
    "Bio": "blabla",
    "Birth": 1975
  }
},
{
  "Title": "Eternal Sunshine of the Spotless Mind",
  "Description": "blabla",
  "Year": 2004,
  "Genre": {
    "Name": "Drama",
    "Description": "blabla"
},
  "Director": {
  "Name": "Michael Gondry",
  "Bio": "blabla",
  "Birth": 1975
  }
},
{
  "Title": "Memento",
  "Description": "blabla",
  "Year": 2000,
  "Genre": {
    "Name": "Thriller",
    "Description": "blabla"
},
  "Director": {
  "Name": "Christopher Nolan",
  "Bio": "blabla",
  "Birth": 1955
  }
},
{
  "Title": "Lost in Translation",
  "Description": "blabla",
  "Year": 2003,
  "Genre": {
    "Name": "Drama",
    "Description": "blabla"
},
  "Director": {
  "Name": "Sofia Coppola",
  "Bio": "blabla",
  "Birth": 1948
  }
},
{
  "Title": "500 Days of Summer",
  "Description": "blabla",
  "Year": 2009,
  "Genre": {
    "Name": "Drama",
    "Description": "blabla"
},
  "Director": {
  "Name": "Marc Webb",
  "Bio": "blabla",
  "Birth": 1968
  }
},
{
  "Title": "Catch Me If You Can",
  "Description": "blabla",
  "Year": 2002,
  "Genre": {
    "Name": "Comedy",
    "Description": "blabla"
},
  "Director": {
  "Name": "Steven Spielberg",
  "Bio": "blabla",
  "Birth": 1954
  }
},
{
  "Title": "Batman Begins",
  "Description": "blabla",
  "Year": 2005,
  "Genre": {
    "Name": "Superhero",
    "Description": "blabla"
},
  "Director": {
  "Name": "Christopher Nolan",
  "Bio": "blabla",
  "Birth": 1955
  }
},
{
  "Title": "Inglourious Basterds",
  "Description": "blabla",
  "Year": 2009,
  "Genre": {
    "Name": "Western/Action",
    "Description": "blabla"
},
  "Director": {
  "Name": "Quentin Tarantino",
  "Bio": "blabla",
  "Birth": 1963
  }
},
{
  "Title": "The Lord of the Rings: The Fellowship of the Ring",
  "Description": "blabla",
  "Year": 2001,
  "Genre": {
    "Name": "Drama",
    "Description": "blabla"
},
  "Director": {
  "Name": "Peter Jackson",
  "Bio": "blabla",
  "Birth": 1959
  }
},
{
  "Title": "Wall-E",
  "Description": "blabla",
  "Year": 2008,
  "Genre": {
    "Name": "Children",
    "Description": "blabla"
},
  "Director": {
  "Name": "Andrew Stanton",
  "Bio": "blabla",
  "Birth": 1971
  }
}
];

let users = [
  {
  id: 1,
  name: "John",
  favoriteMovies: []
},
{
  id: 2,
  name: "Kristen",
  favoriteMovies: ["Eternal Sunshine of the Spotless Mind", "Batman Begins"]
},
{
  id: 3,
  name: "Gwen",
  favoriteMovies: ["Amelie", "Lost in Translation"]
}
];


//READ
app.get('/movies', (req, res) => {
  res.status(200).json(movies);
});

//READ
app.get('/movies/:title', (req, res) => {
  const { title } = req.params;
  const movie = movies.find(movie => movie.Title === title);
    if(movie) {
      res.status(200).json(movie);
    } else {
      res.status(400).send('No such movie.');
    }
  });

  //READ
  app.get('/movies/genre/:genreName', (req, res) => {
    const { genreName } = req.params;
    const genre = movies.find(movie => movie.Genre.Name === genreName).Genre;
      if(genre) {
        res.status(200).json(genre);
      } else {
        res.status(400).send('No such genre.');
      }
    });

    //READ
  app.get('/movies/directors/:directorName', (req, res) => {
    const { directorName } = req.params;
    const director = movies.find(movie => movie.Director.Name === directorName).Director;
      if(director) {
        res.status(200).json(director);
      } else {
        res.status(400).send('No such director.');
      }
    });

//CREATE
  app.post('/users', (req, res) => {
    let newUser = req.body;
    if (newUser.name) {
      newUser.id = uuid.v4();
      users.push(newUser);
      res.status(201).json(newUser);
    } else {
      res.status(400).send('Users need a username.')
    }
  });

  //UPDATE
  app.put('/users/:id', (req, res) => {
    const { id } = req.params;
    const updatedUser = req.body;
    let user = users.find(user => user.id == id);
    if (user) {
      user.name = updatedUser.name;
      res.status(200).json(user);
    } else {
      res.status(400).send('No such user exists.')
    }
  });

//UPDATE AND CREATE
  app.post('/users/:id/:movieTitle', (req, res) => {
    const { id, movieTitle } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
      user.favoriteMovies.push(movieTitle);
      res.status(200).send(movieTitle + ' has been added to  favorites.');
    } else {
      res.status(400).send('No user found.')
    }
  });

  //DELETE
    app.delete('/users/:id/:movieTitle', (req, res) => {
      const { id, movieTitle } = req.params;
      let user = users.find(user => user.id == id);
      if (user) {
        user.favoriteMovies = user.favoriteMovies.filter(title => title != movieTitle);
        res.status(200).send(movieTitle + ' has been removed from  favorites.');
      } else {
        res.status(400).send('No user found.')
      }
    });

  //DELETE
    app.delete('/users/:id/', (req, res) => {
    const { id } = req.params;
    let user = users.find(user => user.id == id);
    if (user) {
      users = users.filter(user => user.id != id);
      res.status(200).send('User with ID '+ user.id + ' has been deleted.');
      res.json(users);
    } else {
      res.status(400).send('No user found.')
    }
  });


//LOGGING REQUESTS
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

//SERVING STATIC FILES
app.use(express.static('./public'))

//ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Sorry, there has been an error!');
  next();
});

//LISTEN PORT 8080
app.listen(8080, () => {
  console.log('App is running on port 8080.');
});
