const express = require('express');
const Router = express.Router;
const adminRouter = Router();
const mongoose = require('mongoose');
const User = require('../models/user.model');
const Asset = require('../models/asset.model');
const Job = require('../models/job.model');
const Activity = require('../models/activity.model');
const Education = require('../models/education.model');
const token = require('../auth/token.js');
const bodyParser = require('body-parser').json();
const ensureAuth = require('../auth/ensure-auth')();
const ensureRole = require('../auth/ensure-roles')();

function hasUserNameAndPassword(req, res, next) {
    const user = req.body;
    if(!user.username || !user.password) {
        return next({
            code: 400,
            error: 'username and password must be provided'
        });
    }
    next();
}

adminRouter


    .get('/verify', ensureAuth, (req, res) => {
        res.send({ valid: true });
    })

    .post('/signup', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        let data = req.body;
        User.find({ username: data.username }).count()
            .then(count => {
                if(count > 0) throw {
                    code: 400,
                    error: `username ${data.username} already exists`
                };
                else if(data.password !== 'supersekritadminpassword') throw {
                    code: 401,
                    error: 'Unauthorized to Create Admin Account'
                };
                else {
                    data.original_signup = new Date();
                    data.last_sign_in = data.original_signup;
                    data.roles = 'admin';
                    return new User(data).save();
                }
            })
            .then(user => token.sign(user))
            .then(token => res.send({ token }))
            .catch(next);
    })

    .post('/signin', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        const data = req.body;

        User.findOne({ username: data.username })
            .then(admin => {
                if(!admin || !admin.comparePassword(data.password)) {
                    throw {
                        code: 400,
                        error: 'invalid username or password'
                    };
                } 
                admin.last_sign_in = new Date();
                return admin.save();
            })
            .then(admin => token.sign(admin))
            .then(token => res.send({token}))
            .catch(next);
            
    })
   /////////////Admin Assets CRUD - GET assets in assets.routes///////////// 
    .post('/assets', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Asset(data).save()
            .then(asset => res.send(asset))
            .catch(next);
    })

    .patch('/assets', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let assetId = req.body._id;

        return Asset.findById(assetId)
            .then(asset => {
               asset.purchase_price = req.body.purchase_price || asset.purchase_price;
               asset.asset_type = req.body.asset_type || asset.asset_type;
               asset.model = req.body.model || asset.model;
               asset.current_value = req.body.current_value || asset.current_value;
               asset.monthly_appreciation_percentage = req.body.monthly_appreciation_percentage || asset.monthly_appreciation_percentage;
               return asset.save();
            })
            .then(asset => res.send(asset))
            .catch(next);
    })

    .delete('/assets', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let assetId = req.body;

        Asset.findByIdAndRemove(assetId)
            .then(assetId => {
                if(!assetId) {
                    res.status(404).send({error: 'Cannot Find Asset'});
                } else {
                    res.send({message: `Asset ${assetId} has been deleted`});
                }
            })
            .catch(next);
    })
/////////////////////Admin Jobs CRUD - GET is in jobs routes////////////////////////////
    .post('/jobs', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Job(data).save()
            .then(job => res.send(job))
            .catch(next);
    })

    .patch('/jobs', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let jobId = req.body;

        return Job.findById(jobId)
            .then(job => {
                job.jobType = req.body.jobType || job.jobType;
                job.jobLevel = req.body.jobLevel || job.jobLevel;
                job.monthlySalary = req.body.monthlySalary || job.monthlySalary;
                job.promotionInterval = req.body.promotionInterval || job.promotionInterval;
                return job.save();
            })
            .then(job => res.send(job))
            .catch(next);
    })

    .delete('jobs', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let jobId = req.body;

        Job.findByIdAndRemove(jobId)
            .then(jobId => {
                if(!jobId) {
                    res.status(404).send({error: 'Cannot Find Job'});
                } else {
                    res.send({message: `Job ${jobId} has been deleted`});
                }
            })
            .catch(next);
    })
///////////////Admin Education CRUD -GET in Ed. Routes/////////////
    .post('/education', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Education(data).save()
            .then(education => res.send(education))
            .catch(next);
    })

    .patch('/education', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let edId = req.body;

        return Education.findById(edId)
            .then(education => {
                education.educationLevel = req.body.educationLevel || education.educationLevel;
                education.educationCost = req.body.educationCost || education.educationCost;
                return education.save();
            })
            .then(education => res.send(education))
            .catch(next);
    })

    .delete('/education', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let edId = req.body;

        Education.findByIdAndRemove(edId)
            .then(edId => {
                if(!edId) {
                    res.status(404).send({error: 'Cannot Find Education'});
                } else {
                    res.send({message: `Education ${edId} has been deleted`});
                }
            })
            .catch(next);
    })
/////////////Admin Activities CRUD - GET is in Activities Route/////
    .post('/activities', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let data = req.body;
        new Activity(data).save()
            .then(activity => res.send(activity))
            .catch(next);
    })

    .patch('/activities', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let actId = req.body;

        return Activity.findById(actId)
            .then(activity => {
                activity.name = req.body.name || activity.name;
                activity.purchasePrice = req.body.purchasePrice || activity.purchasePrice;
                activity.rewardOdds = req.body.rewardOdds || activity.rewardOdds;
                activity.rewardAmount = req.body.rewardAmount || activity.rewardAmount;
                activity.rewardMessage = req.body.rewardMessage || activity.rewardMessage;
                return activity.save();
            })
            .then(activity => res.send(activity))
            .catch(next);
    })

    .delete('/activities', ensureAuth, ensureRole, bodyParser, (req, res, next) => {
        let actId = req.body;
        Activity.findByIdAndRemove(actId)
            .then(actId => {
                if(!actId) {
                    res.status(404).send({error: 'Cannot find Activity'});
                } else {
                    res.send({message: `Activity ${actId} has been deleted`});
                }
            })
            .catch(next);
    });

module.exports = adminRouter;