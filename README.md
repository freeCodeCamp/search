# freeCodeCamp Elasticsearch

[![Known Vulnerabilities](https://snyk.io/test/github/bouncey/freecodecamp-elasticsearch/badge.svg)](https://snyk.io/test/github/bouncey/freecodecamp-elasticsearch)

This is the development repo for a freeCodeCamp search engine

### Requirements

Follow the steps [here](https://www.elastic.co/start) to install Elasticsearch, Kibana and X-pack

Ensure you have `svn` installed on your server, this is used to lift `/seed/challenges` from `freeCodeCamp/freeCodeCamp`

### Usage

Make a copy of `sample.env` to `.env`

You will need an access token for the YouTube api in your `.env` file.

Once your elasticsearch instance is running, use `node init` to seed your cluster

You can query the cluster using the Dev Tools in Kibana
