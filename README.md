RAT
===

Rust Admin Tool (RAT)
This tool is under heavy development, please consider!
Now it's only Beta flagged.
Use only by skilled users.

Roadmap: [roadmap on trello](https://trello.com/b/dynZmdKj/rustadmintool-rat)

Current version: 0.2b

Current status: open beta testing


##Installation
- install node.js
- install git
- clone this repo into some directory
- go to directory and run **npm install**
- in application dir run **mv database.json.example database.json**
- edit **database.json** 
- run **db-migrate up --env production**
- run application by **node app.js**
- visit **127.0.0.1:3000**

##Database migrations
We have a support of database SQL patches (migrations) now!
Please always after update run **db-migrate up --env production** in app directory
