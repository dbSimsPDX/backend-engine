const bodyParser = require('body-parser').json();
const express = require('express');

const Asset = require('../models/asset.model');

const Router = express.Router;

const assetRouter = Router();

assetRouter
    .get('/', (req, res, next) => {
        Asset.find()
            .then(assets => res.send(assets))
            .catch(next);
    })

    /* __NOT__ a feature for a user */
    .post('/', bodyParser, (req, res, next) => {
        new Asset (req.body).save()
            .then(asset => {
                res.send(asset);
            })
            .catch(next);
    });

module.exports = assetRouter;