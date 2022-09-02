const mongoose = require('mongoose');

let movieSchema = mongoose.Schema({
  _id: String,
  Title: {type: String, required: true},
  Description: {type: String, required: true},
  Genre: {
    Name: String,
    Description: String
  },
  Director: {
    Name: String,
    Bio: String,
    Birth: String
  },
  Actors: [String],
  ImagePath: String,
  Featured: Boolean
});

let userSchema = mongoose.Schema({
  Username: {type: String, required: true},
  Password: {type: String, required: true},
  Email: {type: String, required: true},
  Birthday: Date,
  Favorite_Movies: [{type: mongoose.Schema.Types.String, ref: 'Movie'}]
});

const Movie = mongoose.model('Allmovie', movieSchema);
const User = mongoose.model('Alluser', userSchema);

module.exports.Movie = Movie;
module.exports.User = User;
