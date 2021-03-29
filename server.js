'use strict';
// Load the express module into our script
const express = require('express');
const cors = require('cors');
const superagent = require('superagent')

require('dotenv').config();

// App Setup:
const app = express(); //creating the server application
const PORT = process.env.PORT || 3000;

app.use(cors()); //will respond to any request and allow access to our api from another domain

/*
 req=> All information about the request the server received
 res=> methods which can be called to create and send a response to the client
 */

// API Routes:
app.get('/', (req, res) => {
    res.status(200).send('Ok!');
    console.log(req.query);
});

//Location route:
app.get('/location', handleLocation);

//Weather route:
app.get('/weather', handleWeather)

// Error
app.use('*', notFoundHandler);


// Location callback
function handleLocation(req, res) {

        const city = req.query.city;
        let key = process.env.GEOCODE_API_KEY;
        const url = `https://us1.locationiq.com/v1/search.php?key=${key}&q=${city}&format=json&limit=1`;
        superagent.get(url)
        .then(data => {
            const geoData = data.body[0];
            const locationInfo = new Location(city, geoData);
            res.status(200).send(locationInfo);
        })
        .catch((error) => errorHandler(error, request, response))
       
}

//location constructor:
function Location(city, geoData) {
    this.search_query = city;
    this.formatted_query = geoData[0].display_name;
    this.latitude = geoData[0].lat;
    this.longitude = geoData[0].lon;
}


// weather calllback
function handleWeather(req, res) {
    try {
        const weather = require('./data/weather.json');
        const weatherRender = [];
        weather.data.map(day => {
            weatherRender.push(new Weather(day));
        
        })
        res.status(200).json(weatherRender);

    } catch (error) {
        errorHandler(error, request, response);
    }
};

//weather constructor:
function Weather(weather) {
    this.forecast = weather.weather.description;
    this.time = new Date(weather.valid_date).toDateString();
}


function errorHandler(error, req, res) {
    res.status(500).send(error);
}

function notFoundHandler(req, res) {
    res.status(404).send('HUH ?NOT FOUND!');
}

app.listen(PORT, () => {
    console.log(`Server is listening on port ${PORT}`);
});