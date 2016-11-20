var page_token = ("EAARlRnjXgywBABJV4QtYUULpJqyKIZAQYpzAKdbnO5IX4ZA30XFadZAVVsSaqZCWwD04Y8dMEjDN85SCACApo4HYoVFt91FwXIDfW2DFqNUd4ZBPibbM3CI6xB9rSm4cXmvpbES7ux346cuapKPTypSRG59B3CH4LJsnLfy6YZBgZDZD");
var verify_token = ("chicken");
var bodyParser = require('body-parser');
var express = require('express');
var app = express();
var http = require('http').Server(app);

//////////////////////////////////////////////////
var Botkit = require('./lib/Botkit.js');
var controller = Botkit.facebookbot({
    debug: true,
    access_token: page_token,
    verify_token: verify_token,
});

var bot = controller.spawn({});

var assignments = [];
var duedates = [];

controller.hears(['chicken'], 'message_received', function (bot, message) {
    bot.reply(message, 'I love chicken.');
});

controller.hears(['hello', '^hi$'], 'message_received', function (bot, message) {
    bot.startConversation(message, function (err, convo) {
        convo.ask('Hi. What is your name?', function (response, convo) {
            var name = response.text;
            convo.say('Hi ' + name);
            convo.next();
        });
        convo.say('Hello ' + name);
        convo.ask('How many classes are you taking?', function (response, convo) {
            if (parseInt(response.text) < 5) {
                convo.say('Take more classes.');
            } else {
                convo.say('Wow! That\'s a lot!');
            }
            ;
            convo.next();
        });
        convo.ask('Do you have any pending work?', [
            {
                pattern: bot.utterances.yes,
                callback: function (res, convo) {
                    convo.ask('What is your assignment called?', function (response, convo) {
                        assignments.push(response.text)
                        convo.say('Ok!');
                        convo.next();
                    });
                    convo.ask('In how many full days (24 hours) is it due?', function (response, convo) {
                        var hours = parseInt(response.text) * 24;
                        convo.say('Got it!');
                        convo.next();
                    });
                    convo.ask('How many additional hours until it is due?', function (response, convo) {
                        hours = hours + parseInt(response.text);
                        duedate.push(hours);
                        convo.next();
                    });
                }
            },
            {
                pattern: bot.utterances.no,
                callback: function (res, convo) {
                    convo.say("awww");
                    var attachment = {
                        'type': 'template',
                        'payload': {
                            'template_type': 'generic',
                            'elements': [
                                {
                                    'title': 'Chocolate Cookie',
                                    'image_url': 'http://cookies.com/cookie.png',
                                    'subtitle': 'A delicious chocolate cookie',
                                    'buttons': [
                                        {
                                            'type': 'postback',
                                            'title': 'Eat Cookie',
                                            'payload': 'chocolate'
                                        }
                                    ]
                                },
                            ]
                        }
                    };

                    bot.reply(message, {
                        attachment: attachment,
                    });
                    convo.next();
                }
            },

            {
                default: true,
                callback: function (res, convo) {
                    convo.repeat();
                    convo.next();
                }
            }
        ])
    });
});

// If you wanted your bot to respond to additional "hears" such as Go Heels 
// you could do that below using the same syntax from above.


//added to stop the debug tick remarks in console
controller.on('tick', function (bot, event) {
});

controller.setupWebserver(process.env.port || 5000, function (err, webserver) {
    controller.createWebhookEndpoints(webserver, bot, function () {
        console.log('ONLINE!');

    });
});
