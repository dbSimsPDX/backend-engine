const chai = require('chai');
const chaiHttp = require('chai-http');
chai.use(chaiHttp);
const assert = chai.assert;

const app = require('../../lib/app');
const mongoose = require('mongoose');

process.env.DB_URI = 'mongodb://localhost:27017/admin-api-test';
require('../../lib/connection');

describe('admin user', () =>{
    before(() => mongoose.connection.dropDatabase());
    
    const request = chai.request(app);

    describe('admin management', () => {

        const admin = {
            username: 'admin',
            password: 'supersekritadminpassword'
        };
        
        let newAsset = {
            asset_type: 'Vehicle',
            model: 'Tricycle',
            purchase_price: 100,
            current_value: 100,
            monthly_appreciation_percentage: 0
        };
    
        let newEd = {
            educationLevel: 'High School',
            educationCost: 0
        };

        let newAct = {
            name: 'Play Dice',
            purchasePrice: 20,
            rewardOdds: 10,
            rewardAmount: 100,
            rewardMessage: 'Congratulations! You just won $100. Keep rolling!'
        };

        /* Refactor these two functions, they are nearly identical
        Use a higher order function (or just add a status code property) */
 
        const badRequest = (url, data, statusCode, error) =>
            request
                .post(url)
                .send(data)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        assert.equal(res.status, statusCode);
                        assert.equal(res.response.body.error, error);
                    }
                );

        it('admin signup requires username', () =>
            badRequest('/admin/signup', {password: 'supersekritadminpassword'}, 400, 'username and password must be provided')
        );

        it('admin signup requires password', () =>
            badRequest('/admin/signup', {username: 'horatio'}, 400, 'username and password must be provided')
        );

        it('admin signup requires username and special admin password', () =>
            badRequest('/admin/signup', {username: 'horatio', password: 'notsupersekritadminpassword'}, 401, 'Unauthorized to Create Admin Account')
        );

        // move this closer so it is near where it is assigned
        let token = '';

        it('admin signup', () => 
            request
                .post('/admin/signup')
                .send(admin)
                .then(res => assert.ok(token = res.body.token))
        );

        // why not use the badRequest function to test?
        it('can\'t use same user name', () => 
            request
                .post('/admin/signup')
                .send(admin)
                .then(
                    () => { throw new Error('status should not be ok'); },
                    res => {
                        assert.equal(res.status, 400);
                        assert.equal(res.response.body.error, 'username admin already exists');
                    }
                )
        );

        // Make a new describe block to group tests, or seperate files, but not a comment!
///////////////Admin Asset CRUD Tests////////////

        // 1) All of these tests start the same way.
        // 2) One option is to put that functionality in a function:

        function getAdminToken(){
            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token);       
        }


        it('can create new assets', () => {
            // 3) then just start with that promise
            return getAdminToken()
                .then((token) => {
                    return request
                    .post('/admin/assets')
                    .send(newAsset)
                    .set('Authorization', token);
                })
                .then(res => {
                    assert.equal(res.status, 200);
                });
        });

         

        it('can update an asset', () =>{
            // 4) better option would be to put in `before` and store admin token.
            /// then code would just be:
            return request
                .post('/admin/assets')
                .send(newAsset)
                .set('Authorization', adminToken)
                .then(res => {
                    return res.body._id;
                })
                .then(assetId => {
                    return request
                        .patch('/admin/assets')
                        .send({_id: assetId, model: 'Volvo'})
                        .set('Authorization', token)
                        .then(res => {
                            assert.equal(res.body.model, 'Volvo');
                        });
                });
        });

        it('can delete an asset', () => {
            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .post('/admin/assets')
                        .send(newAsset)
                        .set('Authorization', token);
                })
                .then(res => {
                    return res.body._id;
                })
                .then(assetId => {
                    return request 
                        .delete('/admin/assets')
                        .send({_id: assetId})
                        .set('Authorization', token)
                        .then(res => {
                            assert.equal(res.body.message, `Asset { _id: ${assetId},\n  asset_type: \'Vehicle\',\n  model: \'Tricycle\',\n  purchase_price: 100,\n  current_value: 100,\n  monthly_appreciation_percentage: 0,\n  __v: 0 } has been deleted`);
                        });
                });
        });
//////////////////Admin Education CRUD Tests/////////////
        it('can create new education', () => {

            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token)
                .then(token => {
                    return request
                        .post('/admin/education')
                        .send(newEd)
                        .set('Authorization', token);
                })
                .then(res => {
                    assert.equal(res.status, 200);
                    // anything else you can assert?
                    // is a response body expected?
                });
        });

        it('can update an education', () =>{
            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .post('/admin/education')
                        .send(newEd)
                        .set('Authorization', token)
                })
                .then(res => {
                    return res.body._id;
                })
                .then(edId => {
                    return request
                        .patch('/admin/education')
                        .send({_id: edId, educationLevel: 'College'})
                        .set('Authorization', token)
                        .then(res => {
                            assert.equal(res.body.educationLevel, 'College');
                        });
                });
        });

        it('can delete an education', () => {
            let edId = '';

            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .post('/admin/education')
                        .send(newEd)
                        .set('Authorization', token)
                        .then(res => {
                            console.log('RES', res.body);
                            edId = res.body._id;
                            return res.body;
                        });
                })
                .then(() => {
                    return request 
                        .delete('/admin/education')
                        .send({_id: edId})
                        .set('Authorization', token)
                        .then(res => {
                            console.log('RESPONSE', res.body);
                            assert.equal(res.body.message, `Education { _id: ${edId},\n  educationLevel: \'High School\',\n  educationCost: 0,\n  __v: 0 } has been deleted`);
                        });
                });
        });
///////////////Admin Activities CRUD Tests//////////////
        it('can create new activity', () => {

            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token)
                .then((token) => {
                    console.log(token);
                    return request
                    .post('/admin/activities')
                    .send(newAct)
                    .set('Authorization', token);
                })
                .then(res => {
                    assert.equal(res.status, 200);
                });
        });

        it('can update an activity', () =>{
            let actId = '';

            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .post('/admin/activities')
                        .send(newAct)
                        .set('Authorization', token)
                        .then(res => {
                            actId = res.body._id;
                            return res.body;
                        });
                })
                .then(() => {
                    return request
                        .patch('/admin/activities')
                        .send({_id: actId, rewardOdds: 50})
                        .set('Authorization', token)
                        .then(res => {
                            assert.equal(res.body.rewardOdds, 50);
                        });
                });
        });

        it('can delete an activity', () => {
            let actId = '';

            return request
                .post('/admin/signin')
                .send(admin)
                .then(res => res.body.token)
                .then((token) => {
                    return request
                        .post('/admin/activities')
                        .send(newAct)
                        .set('Authorization', token)
                        .then(res => {
                            console.log('RES', res.body);
                            actId = res.body._id;
                            return res.body;
                        });
                })
                .then(() => {
                    return request 
                        .delete('/admin/activities')
                        .send({_id: actId})
                        .set('Authorization', token)
                        .then(res => {
                            console.log('RESPONSE', res.body);
                            assert.equal(res.body.message, `Activity { _id: ${actId},\n  name: \'Play Dice\',\n  purchasePrice: 20,\n  rewardOdds: 10,\n  rewardAmount: 100,\n  rewardMessage: \'Congratulations! You just won $100. Keep rolling!\',\n  __v: 0 } has been deleted`);
                        });
                });
        });
    });
});

