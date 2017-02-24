const User = require('./models/user.model');
const Job = require('./models/job.model');
const Asset = require('./models/asset.model');


module.exports = function update() {
    ///
    //NOTES CHECK USER ROUTE TO ENSURE JOB STARTS AT ENTRY level///
    ////
    //
    return User.findOne({username: 'user801'})
        .then(user => {
            //this section is working
            user.age += .0834;
            user.job.months_worked += 1;
            user.save();
            return user;
        })
        .then(user => {
            let userJob = user.job;
            Job.findById(userJob.job_name)
                .then(job => {
                    user.bank_account += job.monthlySalary;
                    user.networth += job.monthlySalary;
                    if (user.networth >= 1000000) {
                        user.retired = true;
                        user.save();
                        return 'RETIRED';
                    }
                    user.save();
                    if (job.promotionInterval === 0 || job.promotionInterval > user.months_worked) {
                        user.job = user.job;
                        user.save();
                    } else {
                        let newJob = {};
                        return Job.find( { jobType: job.jobType } )
                            .then(jobs => {
                                if(!jobs.length) return;
                                if(job.jobLevel === 'Entry') {
                                    let foundJob = jobs.filter(j => {
                                        return j.jobLevel === 'Mid-level';
                                    });
                                    newJob.start_date = new Date();
                                    newJob.months_worked = 0;
                                    newJob.job_name = foundJob[0]._id;
                                    user.job = newJob;
                                    user.save();
                                    return user;
                                } else if(job.jobLevel === 'Mid-level') {
                                    let foundJob = jobs.filter(j => {
                                        return j.jobLevel === 'Senior';
                                    });
                                    user.job.months_worked = 0;
                                    newJob.start_date = new Date();
                                    newJob.months_worked = 0;
                                    newJob.job_name = foundJob[0]._id;
                                    return user.job = newJob;
                                }
                            })
                        
                    }
                })
                user.save()
                return user;
        })
        .catch()
};
