const express = require('express'),
morgan = require('morgan'),
fs = require('fs'),
path = require('path');


let movieList = [
  {title: 'Amelie', director: 'Jean-Pierre Jeunet', year: '2001'}, {title: 'Eternal Sunshine of the Spotless Mind', director: 'Michael Gondry', year: '2004'}, {title: 'Memento', director: 'Christopher Nolan', year: '2000'}, {title: 'Lost in Translation', director: 'Sofia Coppola', year: '2003'}, {title: '500 Days of Summer', director: 'Marc Webb', year: '2009'}, {title: 'Catch Me If You Can', director: 'Steven Spielberg', year: '2002'}, {title: 'Batman Begins', director: 'Christopher Nolan', year: '2005'}, {title: 'Inglourious Basterds', director: 'Quentin Tarantino', year: '2009'}, {title: 'The Lord of the Rings: The Fellowship of the Ring', director: 'Peter Jackson', year: '2001'}, {title: 'Wall-E', director: 'Andrew Stanton', year: '2008'}
];

const app = express();

const accessLogStream = fs.createWriteStream(path.join(__dirname, 'log.txt'), {flags: 'a'})

app.use(morgan('combined', {stream: accessLogStream}));

app.use(express('public'));

app.get('/movies', (req, res) => {
  res.json(movieList);
});

app.get('/', (req, res) => {
  res.send('Welcome to my movie database!');
});

app.listen(8080, () => {
  console.log('App is running on port 8080.');
});
