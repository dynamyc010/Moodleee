var moodle = require('moodle-client');
var config = require('./config.json');
var fs = require('fs');

moodle.init({
    wwwroot: config.moodle.url,
    // username: config.moodle.username,
    // password: config.moodle.password,
    token: config.moodle.tokens[0].token,
    service: "moodleee-discord-bot",
    moodlewsrestformat: 'json',
    moodlewssettinglang: 'en',

}).then(function(client) {
    //console.log(client.token);
    return do_something(client);

}).catch(function(err) {
    console.log("Unable to initialize the client: " + err);
});


function do_something(client) {
    // return client.get_courses().then(function(courses) {
    // }
    return client.call({
        wsfunction: "core_calendar_get_calendar_upcoming_view",
        //wsfunction: "core_course_get_contents",
        // args: {
        //     users: {
        //         "lang": "en",
        //     }
        // }

    }).then(function(value) {
        // courses = value.courses;
        // courses.forEach(course => {
        //     return client.call({})
        // });
        //fs.writeFileSync('core_calendar_get_calendar_upcoming_view.json', JSON.stringify(value, null, 2));
        value.events.forEach(event => {
            console.log(`${event.name} (${event.timesort})`);
        });
        //console.log(value.courses[0].assignments);
        return;
    });
}
