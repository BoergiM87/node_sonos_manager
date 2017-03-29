# node_sonos_manager
A small sonos group manager with text to speech and alert function by applying node_sonos_http_api.

How to Setup:
- 
Install node

Install Sonos http API:

`git clone https://github.com/jishi/node-sonos-http-api`

`cd node-sonos-http-api`

`npm install --production`

Start API

`npm start`

Install Sonos Manager:

`git clone https://github.com/BoergiM87/node_sonos_manager.git`

`cd node_sonos_manager.git`

`npm install`

Start Sonos Manager:

`node server.js`


Settings
-
**Login**

Administator:
Username = admin
Password = 123

User:
Username = User
Password = 123

You can edit the default user credentials in the Settings.json and you can add new users in it.

```
"users": [
    {
      "name": "admin",
      "password": "123",
      "group": "admins"
    },{
      "name": "user",
      "password": "123",
      "group": "users"
    },{
      "name": "example",
      "password": "123",
      "group": "users"
    }
  ],
```

To disable the login for localhost:
```
"localhostLoggedIn": true,
```

To disable the login for all:
```
"login": `false,
```
