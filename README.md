# dbSimsPDX
A backend game of life. 

The goal of the game is to retire as young as possible with a networth of $1,000,000! 
As a player, you start the game as an 18 year old high school graduate with an entry level, unskilled job. 
With the random amount of money in your bank account, you can choose how to spend your money whether it be on education, assets, or activities.
Spending money on education, means you lose that amount from your networth, but you advance your career to a higher paying job with more earning potential.
Spending money on assets, means you own cool stuff and your networth doesn't change.
Spending money on activities, means you get to participate in something fun with a chance of winning a reward!
Keep in mind, a day in real life is a month in game time. Each day, you will be paid your salary automatically.


## Getting Started as a Player
To play the game, use Postman at the following address: https://dbsimspdx.herokuapp.com/
All posts sent must be in JSON format.

## How to play

### User Signup
```
POST /user/signup
```
- create a user account with a unique username and password
- a token will be returned that needs to be added to the Authorization header

### User Signin
```
POST /user/signin
```
- signin to existing user account with username and password
- a token will be returned that needs to be added to the Authorization header

### Retrieve User Object
```
GET /user/<username>
```
- shows user's progress in the game
- stats include:
    - retirement status
    - age
    - bank account amount
    - net worth
    - signup date
    - last signin date
    - role
    - education level
    - current job
    - purchased activities
    - purchased assets

### Purchase Education
Every player starts with a free, high school level education. This qualifies the player for an unskilled, entry level job. The player can purchase higher level education, which will lead to higher income potential.
```
GET /education
```
- returns all available education options for purchase
- note: see Job Options section for additional career information

```
POST /user/:username/education
```
- copy an education `_id` from `GET /education`
- add the `_id` to the `body`
- purchase education for listed cost (user must have enough funds to purchase)
- purchased education will replace existing level of education and the player will start their new career track at entry level

### Job Options
The player can earn additional money in their bank account by working. Available career tracks are dependent on the education level of the player. Players are promoted at their current jobs automatically according to the monthly promotion interval for their current position.
```
GET /jobs
```
- returns all available career options for reference
    - vocational education leads to blue collar jobs
    - college education leads to white collar jobs

### Purchase Asset
The user can purchase assets like houses and vehicles, which add to their net worth.
```
GET /assets
```
- returns all available assets available for purchase

```
POST /user/:username/assets
```
- copy an asset `_id` from `GET /assets`
- add the `_id` to the `body`
- purchase asset for listed cost (user must have enough funds to purchase)
- asset will appear in user object

### Purchase Activities
The player can choose to purchase activities, which could result in random monetary rewards
```
GET /activities
```
- returns all available activities available for purchase
- this information includes the activity name, price, rewards odds out of 100, and reward amount

```
POST /user/:username/activities
```
- copy an activity `_id` from `GET /activities`
- add the `_id` to the `body`
- purchase activities for listed cost (user must have enough funds to purchase)

### Update User
```
PATCH /user/me/changeAccountInfo
```
- updates player's username or password

### Delete User
```
DELETE /user/me
```
- deletes player account


## Getting Started as an Admin
Those with admin role accounts have permission to post, patch, and delete new asset, education, job, and activity resources.

### Admin Signup
```
POST /admin/signup
```
- create an admin account with a unique username
- a specific password must be provided to create an admin account
- if successful, a token will be returned that needs to be added to the Authorization header

### Admin Signin
```
POST /admin/signin
```
- signin to existing admin account with username and password
- a token will be returned that needs to be added to the Authorization header

### Admin Permissions for Assets, Education, Jobs, and Activities
Note: In all of the routes below, `/assets` can be replaced with `/education`, `/jobs`, or `/activities`.

```
POST /admin/assets
```
Adds new asset to the asset list.

```
PATCH /admin/assets
```
Updates an existing asset.

```
DELETE /admin/assets
```
Deletes an existing asset.


## Getting Started as a Developer
1. Install [Node.js](https://nodejs.org/en/)
2. Run `git clone https://github.com/dbSimsPDX/backend-engine.git`
3. Run `npm install`
4. Run `npm run start:watch` to run server.js with nodemon locally
5. Run mongodb for database

### Coding Standards
1. See eslintrc for coding standards.

### Test
1. Run `npm test`
2. Tests are run with Mocha

## Created by
[Brigitte Huneke](https://github.com/bhuneke) &&
[Meghan Rose](https://github.com/meghanroserebecca) && 
[Thomas Shultz](https://github.com/mizutombo) &&
[Kevin Wong](https://github.com/cmd-kvn)
