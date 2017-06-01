const express = require('express');
const Router = express.Router;
const userRouter = Router();
const User = require('../models/user.model');
const Asset = require('../models/asset.model');
const Job = require('../models/job.model');
const Activity = require('../models/activity.model');
const Education = require('../models/education.model');
const token = require('../auth/token.js');
const bodyParser = require('body-parser').json();
const ensureAuth = require('../auth/ensure-auth')();

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

function getJob(query) {
    // it's really this easy to have mongo do the work:
    return Job.aggregate([
        { $match: { jobLevel: 'Entry', jobType: query } },
        { $sample: { size: 1 } }
    ])
    .then(jobs => {
        if(!jobs.length) return;
        return {
            start_date: new Date(),
            months_worked: 0,
            job_name: jobs[0]._id,

        };
    });
}

function getFirstEducation() {
    // don't define variables in broader scope than needed!
    // let firstEd = {};
    return Education.findOne( { educationLevel: 'High School' } )
        .then(school => {
            if(!school) return;
            return school._id;
        });
}

userRouter
    .get('/verify', ensureAuth, (req, res) => {
        res.send({ valid: true });
    })

/* don't put comment bands like this in your code. :( 
    Find a way to beter modularize your code    
*/

//////////////////////////////USER/////////////////////////////////

    .post('/signup', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        let data = req.body;
        User.find({ username: data.username }).count()
            .then(count => {
                if(count > 0) throw {
                    code: 400,
                    error: `username ${data.username} already exists`
                };
                else {
                    return Promise.all([
                        getJob('Unskilled'),
                        getFirstEducation(),
                    ]);
                }
            })
            .then(([job, education]) => {
                data.retired = false; 
                data.age = 18;
                data.bank_account = Math.floor(Math.random()*200000) + 1;
                data.networth = data.bank_account;
                data.assets = [];
                data.activities = [];
                data.original_signup = new Date();
                data.last_sign_in = data.original_signup;
                data.roles = 'user';
                data.job = job;
                data.education = education;
                return new User(data).save();
            })
            .then(user => token.sign(user))
            .then(token => res.send({ token }))
            .catch(next);
    })

    .post('/signin', bodyParser, hasUserNameAndPassword, (req, res, next) => {
        const data = req.body;

        User.findOne({ username: data.username })
            .then(user => {
                if(!user || !user.comparePassword(data.password)) {
                    throw {
                        code: 400,
                        error: 'invalid username or password'
                    };
                } 
                user.last_sign_in = new Date();
                user.save();
                return user;
            })
            .then(user => token.sign(user))
            .then(token => res.send({token}))
            .catch(next);
            
    })

    .post('/:username/assets', bodyParser, ensureAuth, (req, res, next) => {
        let data = req.body;
        let desiredAsset = {};
        let savedAsset = {};

        // security hole: you are allowing any user to change another user's
        // data. If this is intended to be the same as logged in user, 
        // you need to use req.user.id

        // Also, these are parallel, not sequention actions:

        Promise.all([
            Asset.findById(data._id),
            User.findById(req.user.id)
        ])
        .then(([desiredAsset, user]) => {
            
            const cash = user.bank_account;
            if(desiredAsset.purchase_price > cash) { 
                // use your error handler via next:
                throw { code: 400, error: 'You do not have funds for this purchase'};
            }
            // throw exists, so no need to else here
            user.bank_account = user.bank_account - desiredAsset.purchase_price;
            savedAsset.purchase_date = new Date();
            savedAsset.asset_name = desiredAsset._id;
            user.assets.push(savedAsset);
            return user.save();
        })
        .then(user => res.send(user))
        .catch(next);
    })

    .post('/:username/activities', bodyParser, (req, res, next) => {
        
        // The code in this route is a mess, I've cleaned it up as 
        // example

        // original function was mixing asynchronous and synchronous behavior
        // (has user.save(), but returns a value)
        
        // this could go at top of module...
        const REWARD_MESSAGE = 'YOU WON THE LOTTERY!!!! Congratulations!!!  You have achieved or surpassed a total networth of $1M dollars.  You have won the dbSimsPDX game and are able to retire at the young age of ' + `${user.age}` + ' years old ... !!!';
        const NO_REWARD_MESSAGE = 'You got what you paid for! No reward today. Womp.';

        function isReword(odds, networth) {
            let randomNum = Math.floor(Math.random()*100 + 1);
            return randomNum <= odds && networth > 1000000;
        }        
        
        // this functionality should be moved onto user model:
        // user.addActivity(activity)
        function getActivityOutcome(user, activity) {
            const wonReward = isReword(activity.rewardOdds, user.networth);
            const newActivity = { activity_name: activity._id };
            user.activities.wonReward = wonReward;
            user.activities.push(newActivity);
            activity.rewardMessage = NO_REWARD_MESSAGE;

            if (wonReward) {
                user.bank_account = user.bank_account + activity.rewardAmount;
                user.networth = user.networth + activity.rewardAmount;
                if(user.networth > 1000000) {
                    activity.rewardMessage = REWARD_MESSAGE;
                }
            }

            return user
                .save()
                .then(() => ({ message: activity.rewardMessage }));
        }


        Promise.all([
            Activity.findById(req.body),
            User.findById(req.user.id)
        ])
        .then(([desiredActivity, user]) => {
            const cash = user.bank_account;

            if(desiredActivity.purchasePrice > cash) {
                throw { code: 400, error: 'You do have funds for this purchase' };
            }

            user.bank_account -= desiredActivity.purchasePrice;
            user.networth -= desiredActivity.purchasePrice;            
            return getActivityOutcome(user, desiredActivity);
        })
        .then(message => res.send(message))
        .catch(next);

        // request body is a string? use an object instead: { id: <id> }
        // let reqActivityId = req.body;
        // let desiredActivity = {};
        // let savedActivity = {};
        // const username = req.params.username;
        
        // You've cut and pasted this comment WITHOUT
        // understanding what it means :( 
        // (it doesn't apply here)        
        //TODO: investigate using aggregate $sample

        // Activity.findById(reqActivityId)
               // this then block does nothing
        //     .then(activity => {
        //         if(!activity) return;
        //         else {desiredActivity = activity;}
        //     });

        // There is no connection from previous promise and this one.
        // Are are relying on unguaranteed order of execution
        // return User.findOne( { username: username } )
        //     .then(user => {
        //         const cash = user.bank_account;

        //         if(desiredActivity.purchasePrice > cash) {
        //             res.status(400).send({error: 'You do have funds for this purchase'});
        //         } else {
        //             user.bank_account = user.bank_account - desiredActivity.purchasePrice;
        //             user.networth = user.networth - desiredActivity.purchasePrice;
        //             savedActivity.activity_name = desiredActivity._id;
                    
        //             return getActivityOutcome(user, desiredActivity);
        //         }
        //     })
        //     .then(message => {
        //         res.send(message);
        //     })
        //     .catch(next);


    })

    .post('/:username/education', bodyParser, (req, res, next) => {
        let reqEdId = req.body;
       

        const username = req.params.username;
        // WAY TOO NESTED!
        // return promises and handle in next "this"
        Education.findById(reqEdId)
            .then(desiredEd => {
                if(!desiredEd) return;
                return User.findOne({ username: username })
                    .then(user => {
                        const cash = user.bank_account;

                        if (desiredEd.educationCost > cash) {
                            res.status(400).send({ error: 'You do not have funds for this purchase' });
                        } else {
                            user.bank_account = user.bank_account - desiredEd.educationCost;
                            user.networth = user.networth - desiredEd.educationCost;
                            user.education = desiredEd._id;
                            if (desiredEd.educationLevel === 'Vocational') {
                               return getJob('Blue Collar')
                                    .then(job => {
                                        user.job = job;
                                        user.save();
                                        return user;
                                    });
                            } else if (desiredEd.educationLevel === 'College') {
                                return getJob('White Collar')
                                    .then(job => {
                                        user.job = job;
                                        user.save();
                                        return user;
                                    });
                            } else {
                                return user;
                            }
                        }
                    })
                    .then(user => res.send(user))
                    .catch(next);

            });


    })

    .get('/:username', ensureAuth, (req, res, next) => {
        const username = req.params.username;
        User.findOne({ username: username })
            .populate('job.job_name')
            .populate('assets.asset_name')
            .populate('activities.activity_name')
            .populate('education')
            .then(user => {
                if(!user){
                    res.status(404).send({error: 'Cannot Find User'});
                } else if (user.networth >= 1000000) {
                    // if user's networth is greater than or equal to $1M, then declare as winner ...
                    res.send('Congratulations!!!  You have achieved or surpassed a total networth of $1M dollars.  You have won the dbSimsPDX game and are able to retire at the young age of ' + `${user.age}` + ' years old ... well done!!!  ');
                    /* TODO: provide user with final update of their data ... */
                    res.send(user);
                }
                else { 
                    /* TODO: provide user with update of their current data ... */
                    res.send(user);
                }
            })
            .catch(next);
    })
    
    .patch('/me/changeAccountInfo', ensureAuth, bodyParser, (req, res, next) => {
        const userId = req.user.id;
        return User.findByIdAndUpdate(userId)
            .then(user => {
                user.username = req.body.username || user.username;
                if(req.body.password) user.password = req.body.password;
                user.save();
                return user;
            })
            .then(user => res.send(user))
            .catch(next);
    })

    .delete('/me', ensureAuth, bodyParser, (req, res, next) => {
        const userId = req.user.id;
        User.findByIdAndRemove(userId)
            .then( () => res.send({message: 'Your user account has been deleted!'}))
            .catch(next);
    });
        /* TODO: need to figure out a way to have the game check the user's total networth and then provide them with an updated summary of their age, networth, bank_account, assets, etc. WITHOUT having to go through the username path */


module.exports = userRouter;