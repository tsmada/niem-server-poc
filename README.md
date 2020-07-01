## Features

This is a simple express server which listens for POST requests on localhost:80/api/ for specific models and echos them out. Currently there is only one model based on the NIEM [tutorial](http://niem.github.io/json/tutorial/)

## Models

- Motor Vehicle Crash

POST /api/crash (JSON Payload)

![alt text](https://github.com/tsmada/niem-server-poc/raw/master/images/example_post.png "Crash")

## Quick start

1.  Clone this repo using `git clone https://github.com/tsmada/niem-server-poc/niem-server-poc.git`
3.  Move to the appropriate directory: `cd niem-server-poc`.<br />
4.  Run `npm install` <br />
    _At this point you can run `npm start` to POST JSON data to /api/crash