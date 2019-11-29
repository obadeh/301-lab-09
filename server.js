'use strict';

// Dependecies (express, cors, dotenv)

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const superagent = require('superagent');

const PORT = process.env.PORT || 3000;

const app = express();

app.use( cors() );

/// from modules

// const client=require('./mudules/client.js');
// const location=require('./mudules/location.js');
// const weather=require('./mudules/weather.js');
// const events=require('./mudules/events.js');
// const yelp=require('./mudules/yelp.js');
// const trails=require('./mudules/trails.js');
// const movies=require('./mudules/movies.js');



// make the the callBack function a seprate fuctions :locationHandler,weatherHandler

app.get('/location', locationHandler);
app.get('/weather', weatherHandler);
app.get('/events',eventHandler);
// app.get('/yelp',yelpHandler);
// app.get('/trails',trailsHandler);
app.get('/movies',moviesHandler);
app.get('/yelp',yelpHandler)

function locationHandler(req,res) {
  // Query String = ?a=b&c=d
  getLocation(req.query.data)
    .then( (locationData) => res.status(200).json(locationData) );
}

function getLocation(city) {
  // No longer get from file
  // let data = require('./data/geo.json');

  // Get it from Google Directly`
  const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${city}&key=${process.env.API}`

  return superagent.get(url)
    .then( data => {
      return new Location(city, data.body);
    })

}

function Location(city, data) {
  this.search_query = city;
  this.formatted_query = data.results[0].formatted_address;
  this.latitude = data.results[0].geometry.location.lat;
  this.longitude = data.results[0].geometry.location.lng;

}


// WEATHER
// ------------------------------- _________________ //

function weatherHandler(req,res) {
  // Query String = ?a=b&c=d
  getWeather(req.query.data)
    .then( weatherData => res.status(200).json(weatherData) );

}

function getWeather(query) {
  // let data = require('./data/darksky.json');
  const url = `https://api.darksky.net/forecast/${process.env.DARK_SKY}/${query.latitude},${query.longitude}`;
  return superagent.get(url)
    .then( data => {
      let weather = data.body;
      return weather.daily.data.map( (day) => {
        return new Weather(day);
      });
    });
}

function Weather(day) {
  this.forecast = day.summary;
  this.time = new Date(day.time * 1000).toDateString();
}

// add event >>>>>>>>>>>>>>>


function eventHandler(req,res) {
    // Query String = ?a=b&c=d
    getEvent(req.query.data.search_query)
      .then( eventData => res.status(200).json(eventData) );
  
  }
  
  function getEvent(city) {
    // let data = require('./data/darksky.json');
    const url = `http://api.eventful.com/json/events/search?app_key=${process.env.EVENT_KEY}&location=${city}`;
    return superagent.get(url)
      .then( data => {
        let eventA = JSON.parse(data.text);

        // console.log('data : ', eventA);
        return eventA.events.event.map( (day) => {
            // console.log({day});
          return new Event(day);
        });
      });
  }
  
  function Event(day) {
    this.link=day.url;
    this.name=day.title;
    this.event_date=day.start_time;
    this.summary=day.description;  
}
  

function moviesHandler(req,res){
  // console.log('req : ', req);
  // console.log('query : ', query);
  console.log('req.query.data : ', req.query.data.search_query);
    getMovies(req.query.data.search_query)
    .then( moviesDate => res.status(200).json(moviesDate) );

}

function getMovies(location){
    const url = `https://api.themoviedb.org/3/search/movie/?api_key=${process.env.MOVIES_KEY}&query=${location}`;
    return superagent.get(url)
      .then( data => {
        parseData(data.body);
      });

}

function parseData(data){
  try{
    // console.log('data : ', data.results);
    const movies= data.results.map((movie)=>{
      let moviesObg =new Movies(movie)
      console.log('movie : ', moviesObg);
      return moviesObg;
    });
    return Promise.resolve(movies);

  }catch(e){return Promise.reject(e);
  }
}



function yelpHandler(req,res){
  // console.log('req : ', req);
  // console.log('query : ', query);
  console.log('req.query.data : ', req.query.data.search_query);
  getYelp(req.query.data.search_query)
  .then( yelpDate => res.status(200).json(yelpDate) );

}





function getYelp(location){
const url = `https://api.yelp.com/v3/businesses/search?location=${location}`;
return superagent.get(url)
  .set('Authorization',`Bearer${process.env.YELP}`)
  .then( data => {
    parseDataYelp(data.body);
  });

}

function parseDataYelp(data){
try{
// console.log('data : ', data.results);
const movies= data.results.map((movie)=>{
  let moviesObg =new Yelp(movie)
  console.log('yelp : ', moviesObg);
  return moviesObg;
});
return Promise.resolve(movies);

}catch(e){return Promise.reject(e);
}
}

// console.log('data : ', eventA);
// return eventA.events.event.map( (day) => {
//     console.log({day});
//   return new Event(day);
// });

function Movies(movie){
  this.title=movie.title;
  this.overview=movie.overview;
  this.average_votes=movie.vote_average;
  this.total_votes=' '
  this.image_url='https://image.tmdb.org/t/p/w500' + movie&&movie.poster_path;
  this.popularity=movie.popularity;
  this.released_on=movie&&movie.release_date;
}




function Yelp(){
  this.name=business.name;
  this.image_url=business.image_url;
  this.price=business.price;
  this.rating=business.rating;
  this.url=business.url;

}



app.use('*', (req,res) => {
 

  res.status(404).send('NOT FOUND!');
});

app.listen( PORT, () => console.log('hello world, from port', PORT));