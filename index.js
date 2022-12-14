const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path'),
bodyParser = require('body-parser'),
//is uuid no longer needed?
//uuid = require('uuid'),
mongoose = require('mongoose');
const Models = require('./models.js');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const cors = require('cors');
app.use(cors());

const { check, validationResult } = require('express-validator');
//import auth files
let auth = require('./auth')(app);
const passport = require('passport');
require('./passport');

const Movies = Models.Movie;
const Users = Models.User;
//const Genres = Models.Genre;
//const Directors = Models.Director;

//mongoose.connect('mongodb://localhost:27017/movieAPI', {useNewUrlParser: true, useUnifiedTopology: true});
mongoose.connect(process.env.connection_uri, {useNewUrlParser: true, useUnifiedTopology: true});

//GET all users
app.get('/users', (req, res) => {
  Users.find()
  .then((users) => {
    res.status(201).json(users);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

app.get('/users/:Username', (req, res) => {
  Users.findOne({ Username: req.params.Username}).select('-Password')
  .then((user) => {
    res.status(201).json(user);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


//READ GET all movies
app.get('/movies', 
passport.authenticate('jwt', {session: false}), 
  (req, res) => {
  Movies.find()
  .then((movies) => {
    res.status(201).json(movies);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});

//READ GET a movie by title
app.get('/movies/:Title', passport.authenticate('jwt', {session: false}), (req, res) => {
  Movies.findOne({ Title: req.params.Title})
  .then((movie) => {
    res.json(movie);
  })
  .catch((err) => {
    console.error(err);
    res.status(500).send('Error: ' + err);
  });
});


  //READ GET movies by genre
  app.get('/movies/genres/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.find({ "Genre.Name": req.params.Name})
    .then((movies) => {
      res.json(movies);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

  //READ GET data about a genre
  app.get('/movies/genre/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ "Genre.Name": req.params.Name})
    .then((movies) => {
      res.json(movies.Genre);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

    //READ GET director info by director name
  app.get('/movies/director/:Name', passport.authenticate('jwt', {session: false}), (req, res) => {
    Movies.findOne({ "Director.Name": req.params.Name})
    .then((movies) => {
      res.json(movies.Director);
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
    });

//CREATE: Add a user
// We expect JSON in this format:
// {
//   ID: Integer, (can we use uuid?)
//   Username: String,
//   Password: String,
//   Email: String,
//   Birthday: Date
// }
  app.post('/registration',
  //validation logic for username, password and email
  [
    check('Username', 'Username is required').isLength({min: 2}),
    check('Username', 'Username contains non alphanumeric characters, not allowed.').isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail()
  ], (req, res) => {
    //check validation object for errors
    let errors = validationResult(req);
    if(!errors.isEmpty()) {
      return res.status(422).json({errors: errors.array()});
    }
    //hash the password
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOne({ Username: req.body.Username})
    .then((user) => {
      if (user) {
        return res.status(400).send(req.body.Username + ' already exists.')
      } else {
        Users.create({
          Username: req.body.Username,
          Password: hashedPassword,
          Email: req.body.Email,
          Birthday: req.body.Birthday
        })
        .then((user) => {res.status(201).json(user) })
        .catch((error) => {
          console.error(error);
          res.status(500).send('Error: ' + error);
        })
      }
    })
    .catch((error) => {
      console.error(error);
      res.status(500).send('Error: ' + error);
    });
  });


  //UPDATE a user's info by username, in JSON format
//   {
//   Username: String, required
//   Password: String, required
//   Email: String, required
//   Birthday: Date
// }
  app.put('/users/:Username', passport.authenticate('jwt', {session: false}), [
    //validation logic for updating info
    check('Username', 'Username is required').isLength({min: 5}),
    check('Username', 'Username contains non alphanumeric characters, not allowed.').isAlphanumeric(),
    check('Password', 'Password is required.').not().isEmpty(),
    check('Email', 'Email does not appear to be valid.').isEmail()
  ], (req, res) => {
    let errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(422).json({ errors: errors.array() });
    }
    //hash password
    let hashedPassword = Users.hashPassword(req.body.Password);
    Users.findOneAndUpdate({ Username: req.params.Username },
    { $set:
      {
        Username: req.body.Username,
        Password: hashedPassword,
        Email: req.body.Email,
        Birthday: req.body.Birthday
      }
    },
    { new: true },
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

//UPDATE AND CREATE -- add movie to user's list of favorites
  app.post('/users/:Username/movies/:_id', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndUpdate({ Username: req.params.Username}, {
      $push: { Favorite_Movies: req.params._id }
    },
    {new: true},
    (err, updatedUser) => {
      if (err) {
        console.error(err);
        res.status(500).send('Error: ' + err);
      } else {
        res.json(updatedUser);
      }
    });
  });

  //DELETE movie from user favorites - still using findOneandUpdate rather than remove
    app.delete('/users/:Username/movies/:_id', passport.authenticate('jwt', {session: false}), (req, res) => {
      Users.findOneAndUpdate({ Username: req.params.Username}, {
        $pull: { Favorite_Movies: req.params._id }
      },
      {new: true},
      (err, updatedUser) => {
        if (err) {
          console.error(err);
          res.status(500).send('Error: ' + err);
        } else {
          res.json(updatedUser);
        }
      });
    });

  //DELETE user by username
    app.delete('/users/:Username/', passport.authenticate('jwt', {session: false}), (req, res) => {
    Users.findOneAndRemove({ Username: req.params.Username})
    .then((user) => {
      if(!user) {
        res.status(400).send(req.params.Username + ' was not found.');
      } else {
        res.status(200).send(req.params.Username + ' was deleted.');
      }
    })
    .catch((err) => {
      console.error(err);
      res.status(500).send('Error: ' + err);
    });
  });

app.get("/", (req, res) => {
  res.send("Welcome to MyFlix Movie Database!");
});

//LOGGING REQUESTS
const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'});

app.use(morgan('combined', {stream: accessLogStream}));

//SERVING STATIC FILES
app.use(express.static('./public'));

//ERROR HANDLING
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Sorry, there has been an error!');
  next();
});

//LISTEN PORT
const port = process.env.PORT || 8080;
app.listen(port, '0.0.0.0', () => {
  console.log('Listening on Port ' + port);
});
// app.listen(8080, () => {
//   console.log('App is running on port 8080.');
// });
