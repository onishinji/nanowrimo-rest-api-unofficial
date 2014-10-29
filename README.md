nanowrimo-rest-api-unofficial
=============================

An unofficial API around nanowrimo to consolidate data from her API and website.



| Route        |  Methods |Comments |         
| ------------- |:-------------:| -------------|
|  /users     | GET 		| list all nanowrimo users. Not yet implemented |
| /users/:username      | GET      |   retrieve an user |
| /users/:username/friends | GET     |   retrieve buddies for an user. We crawl html source for that.|
| /users/:username/history | GET     |   retrieve word count history for an user.|

