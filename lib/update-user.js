const User = require('./models/user.model');
const Job = require('./models/job.model');

module.exports = function update() {

// WAY TO MUCH nesting here!
User.find()
    .then(users => users.forEach(user => {
        updateUser(user)
            .catch(err => {
                console.log('Unable to update user', user, err)
            });
    }))
    // at least a console log if things fail???
    .catch();
};

function updateUser(user) {
    // no need to refetch, we just retrieved the user
    // User.findById(user._id)
    //     .then(user => {
    user.age += .084;
    user.job.months_worked += 1;
            // what? save then return without even waiting for the save to complete???
            // don't save in chunks like this, just save once...

            // user.save();
            // return user;
        // })
        // .then(user => {
    return Job.findById(user.job.job_name)
        .then(job => {
            user.bank_account += job.monthlySalary;
            user.networth += job.monthlySalary;
            if (user.networth >= 1000000) {
                user.retired = true;
                return user.save();
            }
            if (job.promotionInterval === 0 || job.promotionInterval > user.job.months_worked) {
                return user.save();
            }
            else {
                const level = job.jobLevel === 'Entry' ? 'Mid-level' : 'Senior';

                return Job.findOne({ 
                    jobType: job.jobType,
                    jobLevel: level
                })
                .then(nextJob => {
                    user.job = {
                        start_date: new Date(),
                        months_worked: 0,
                        job_name: nextJob._id,
                    };
                    return user.save();
                });
            }
        });
}
