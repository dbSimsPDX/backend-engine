# dbSimsPDX
A backend game of life. 

# [Visit the game on Heroku](https://dbsimspdx.herokuapp.com/)

The goal of the game is to retire as young as possible with a networth of $1,000,000! 
As a player, you start the game as an 18 year old high school graduate with an entry level, unskilled job. 
With the random amount of money in your bank account, you can choose how to spend your money whether it be on education, assets, or activities.
Spending money on education, means you lose that amount from your networth, but you advance your career to a higher paying job with more earning potential.
Spending money on assets, means you own cool stuff and your networth doesn't change.
Spending money on activities, means you get to participate in something fun with a chance of winning a reward!
Keep in mind, a day in real life is a month in game time. Each day, you will be paid your salary automatically.

## Getting Started // NEEDS EDITING and add HEROKU?
1. Install [Node.js](https://nodejs.org/en/)
2. Run `git clone https://github.com/dbSimsPDX/backend-engine.git`
3. Run `npm install`

## How to play

### User Signup
```
POST /user/signup
```
- create a user account with username and password

### User Signin
```
POST /user/signin
```
- signin to existing user account with username and password

### User Signin
```
GET /user/<username>
```
- shows user's properties

### Purchase Asset
The user can purchase assets like houses and vehicles, which add to their net worth.
```
GET /assets
```
- returns all available assets available for purchase

```
POST /user/<username>/assets
```
- copy an asset `_id` from `GET /assets`
- add the `_id` to the `body`
- purchase asset for listed cost

### Career Options
The player can earn additional money in their bank account by working. Available career tracks are dependent on the education level of the player. Players can be promoted at their current jobs automatically over time.
```
GET /careers
```
- returns all available career options for reference

<!--POST /:id/education
- purchase education at listed cost-->

### Purchase Education
The player can purchase additional education, which will lead to higher income potential.
```
GET /education
```
- returns all available education options for purchase

```
POST /user/<username>/education
```
- copy an education `_id` from `GET /education`
- add the `_id` to the `body`
- purchase education at listed cost

### Purchase Activities
The player can choose to purchase activities, which could result in random benefits or pitfalls.
```
GET /activities
```
- returns all available activities available for purchase

```
POST /user/<username>/activities
```
- copy an activity `_id` from `GET /activities`
- add the `_id` to the `body`
- purchase activities at listed cost

### Delete Player
```
DELETE /:id
```
- deletes user account

<!--## ADMIN Options

post new asset
put/patch
delete
get/get all

post new education
put/patch
delete
get/get all

post new job
put/patch
delete
get/get all

post new activity
put/patch
delete
get/get all-->

## Created by
[Brigitte Huneke](https://github.com/bhuneke) &&
[Meghan Rose](https://github.com/meghanroserebecca) && 
[Thomas Shultz](https://github.com/mizutombo) &&
[Kevin Wong](https://github.com/cmd-kvn)
