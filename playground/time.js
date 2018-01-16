var moment = require('moment');
//Jan 1st 1970 00:00:00 am -> 0(timestamp)

// new Date().getTime() //get timestamp
// var date = new Date();
// console.log(date.getMonth());

// var date = moment();
// console.log(date.format('MMM Do, YYYY'));

// new Date().getTime()
var someTimestamp = moment().valueOf(); //Unix Timestamp
console.log(someTimestamp);

var createdAt = someTimestamp;
var date = moment(createdAt);
console.log(date.format('h:mm a'));
