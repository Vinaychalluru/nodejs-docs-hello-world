/*~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~
           ______     ______     ______   __  __     __     ______
          /\  == \   /\  __ \   /\__  _\ /\ \/ /    /\ \   /\__  _\
          \ \  __<   \ \ \/\ \  \/_/\ \/ \ \  _"-.  \ \ \  \/_/\ \/
           \ \_____\  \ \_____\    \ \_\  \ \_\ \_\  \ \_\    \ \_\
            \/_____/   \/_____/     \/_/   \/_/\/_/   \/_/     \/_/


This is a sample Slack bot built with Botkit.

This bot demonstrates many of the core features of Botkit:

* Connect to Slack using the real time API
* Receive messages based on "spoken" patterns
* Reply to messages
* Use the conversation system to ask questions
* Use the built in storage system to store and retrieve information
  for a user.

# RUN THE BOT:

  Get a Bot token from Slack:

    -> http://my.slack.com/services/new/bot

  Run your bot from the command line:

    token=<MY TOKEN> node slack_bot.js

# USE THE BOT:

  Find your bot inside Slack to send it a direct message.

  Say: "Hello"

  The bot will reply "Hello!"

  Say: "who are you?"

  The bot will tell you its name, where it is running, and for how long.

  Say: "Call me <nickname>"

  Tell the bot your nickname. Now you are friends.

  Say: "who am I?"

  The bot will tell you your nickname, if it knows one for you.

  Say: "shutdown"

  The bot will ask if you are sure, and then shut itself down.

  Make sure to invite your bot into other channels using /invite @<my bot>!

# EXTEND THE BOT:

  Botkit has many features for building cool and useful bots!

  Read all about it here:

    -> http://howdy.ai/botkit

~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~~*/


if (!process.env.token) {
    console.log('Error: Specify token in environment');
    process.exit(1);
}

var Botkit = require('../lib/Botkit.js');
var os = require('os');
var temp = 0;

var path, node_ssh, ssh, fs, exec, shell

fs = require('fs')
sys = require('sys')
path = require('path')
exec = require('ssh-exec')
shell = require('shelljs')
log_fs = require('fs');


function writeLog(log_msg) {
    log_fs.appendFile('robot_log.txt', log_msg, function (err) {
        if (err) throw err;
        console.log('Saved!');
    });
}

function addDc(dcNbr) {
    fs.appendFile('dcList.txt', dcNbr, function (err) {
        if (err) throw err;
        console.log('***********************************************************Saved!' + dcNbr);
    });
}


var controller = Botkit.slackbot({
    debug: true,
});

var bot = controller.spawn({
    token: process.env.token
}).startRTM();

var keyParamDict = {
    'date': {
        'p_count': '3',
        'multi_ind': 'n'
    },
    'version': {
        'p_count': '3',
        'multi_ind': 'n'
    },
    'dflt_path': {
        'p_count': '3',
        'multi_ind': 'n'
    },
    'po': {
        'p_count': '4',
        'multi_ind': 'n'
    },
    'order': {
        'p_count': '4',
        'multi_ind': 'n'
    },
    'mq': {
        'p_count': '4',
        'multi_ind': 'n'
    },
    'delivery': {
        'p_count': '4',
        'multi_ind': 'n'
    },
    'dd_rpt': {
        'p_count': '3',
        'multi_ind': 'n'
    },
    'psg': {
        'p_count': '4',
        'multi_ind': 'y'
    },
    'eod': {
        'p_count': '3',
        'multi_ind': 'n'
    },
    'item': {
        'p_count': '4',
        'multi_ind': 'n'
    }

};


controller.hears(['date', 'version', 'po', 'DFLT_PATH', 'order', 'DD_RPT', 'PSG', 'MQ', 'delivery', 'item', 'eod'], 'direct_message,direct_mention,mention', function (bot, message) {

    var fp = fs.createWriteStream("shellOutput.txt");
    var inpCmd = message.text;
    res = inpCmd.split(' ')
    var validFlag = true;
    var warnmsg = "";
    var formatFlag = false;
    var adddcFlag = false;
    var fsNew = require('fs');
    keyword = res[0].toLowerCase();


    if (res.length < 3) {
        bot.reply(message, {
            "attachments": [
                {
                    "color": "#36a64f",
                    "text": "\nEnter your request in this format : \n *" + keyword + " <DC NUMBER> <COUNTRY CODE> <PARAMS(OPTIONAL)>* "
                }
            ]
        });
        formatFlag = true
        validFlag = false
    }
    else {
        var re = /^[1-9][0-9]{3}$/
        if (res[1].search(re) !== 0) {
            warnmsg = "Maybe you want to re check the entered DC Number : " + res[1] + "\n";
            validFlag = false
        }

        var re2 = /us|cl|br|mx|cn|cr|jp|uk|ca|ni|hn|gt|ar/i
        if (res[2].search(re2) !== 0) {
            warnmsg = warnmsg + 'I have not heard of the country : ' + res[2] + "\n";
            validFlag = false
        }

        var re3 = res[1] + res[2].toUpperCase();;

        var dcTxt = fsNew.readFileSync("dcList.txt").toString('utf-8');
        var result = dcTxt.match(re3)
        if (result == null && validFlag == true) {
            warnmsg = warnmsg + 'You are not allowed to connect to Production Dcs : ' + res[1] + " " + res[2] + "\n";
            validFlag = false
            adddcFlag = true;
        }

        if ((res.length == keyParamDict[keyword].p_count) || (res.length >= keyParamDict[keyword].p_count && keyParamDict[keyword].multi_ind == 'y')) {
            console.log('Pass')
        }
        else {
            warnmsg = warnmsg + 'Please check the no of parameters you have passed for ' + keyword + "\n";
            validFlag = false
        }
    }

    if (validFlag) {
        var currentUser;
        bot.api.users.info({ user: message.user }, function (err, response) {
            if (err) {
                console.log("ERROR :");
            }
            else {
                user = response["user"].real_name;
                text1 = " Hang On " + user.split(' ')[0] + " I'm fetching your results !!! ";
                bot.reply(message, { "text": "```" + text1 + "```" });
                writeLog(log_ts + "|" + user + "|" + inpCmd + "\n");
            }
        });
        var d = new Date();
        var log_ts = d.toJSON();

        exec('sh /u/applic/gls/RoBot/master.sh ' + inpCmd, {
            user: 'gls',
            host: 'us32856s1007d0a.s32856.us.wal-mart.com',
            port: '22',
            key: 'C:/BotKit/botkit-master/id_rsa',
            password: 'l4virus'
        }).pipe(fp)
            .on('finish', function () {
                var fsNew = require('fs');
                var text = fsNew.readFileSync("shellOutput.txt").toString('utf-8');
                console.log("DC ***********************" + text);
                shresult = text;
                len = text.length;
                console.log("DC ***********************" + shresult);
                if (len > 1) {
                    bot.reply(message, { "text": "*@" + user + " Your requested results for " + res[1] + " " + res[2] + " :*\n```" + text + "```" });
                }
                else {
                    text = " Your request is executed , but I don't have any data to show !!! ";
                    bot.reply(message, { "text": "```" + text + "```" });
                }
            });
    }
    else {
        if (formatFlag == false) {
            if (adddcFlag) {
                bot.reply(message, { "text": "```" + warnmsg + "\nIf its a Pre-Production DC , Reach to Admin to add the DC to the list```" });
            }
            else {
                bot.reply(message, { "text": "```" + warnmsg + "\nYou may type 'help' to know what I can do```" });
            }
        }
    }
});


controller.hears(['color_button'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.reply(message, {
        "attachments": [
            {
                "color": "#759025",
                "text": "Choose a Color : ",
                "callback_id": "color_button",
                "attachment_type": "default",
                "title": "What color interests you ?",
                "actions": [
                    {
                        "name": "color",
                        "text": "Red",
                        "type": "button",
                        "value": "red"
                    },
                    {
                        "name": "color",
                        "text": "Green",
                        "type": "button",
                        "value": "green",
                        "confirm": {
                                "title": "Are you sure?",
                                "text": "Wouldn't you prefer a red color?",
                                "ok_text": "Yes",
                                "dismiss_text": "No"
                            }
                    }
                ]
            }
        ]
    });
});

controller.hears(['game_button'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.reply(message,
        {
            "text": "Would you like to play a game?"    ,
            "attachments": [
                {
                    "text": "Choose a game to play",
                    "fallback": "You are unable to choose a game",
                    "callback_id": "wopr_game",
                    "color": "#3AA3E3",
                    "attachment_type": "default",
                    "actions": [
                        {
                            "name": "game",
                            "text": "Chess",
                            "type": "button",
                            "value": "chess"
                        },
                        {
                            "name": "game",
                            "text": "Falken's Maze",
                            "type": "button",
                            "value": "maze"
                        },
                        {
                            "name": "game",
                            "text": "Thermonuclear War",
                            "style": "danger",
                            "type": "button",
                            "value": "war",
                            "confirm": {
                                "title": "Are you sure?",
                                "text": "Wouldn't you prefer a good game of chess?",
                                "ok_text": "Yes",
                                "dismiss_text": "No"
                            }
                        }
                    ]
                }
            ]
        });
});


controller.hears(['help', 'what can you do'], 'direct_message,direct_mention,mention', function (bot, message) {
    bot.reply(message, {
        "attachments": [
            {
                "color": "#36a64f",
                "text": "*DATE*               Get the current date \n *VERSION*        Get the GLS Version \n *DFLT_PATH*    Get the Default Share Path \n *PO*                   Check if the POs loaded in GLS \n *ORDER*           Check if the Customer Order is loaded in GLS \n *MQ*                  Validate MQ for a particular DC. You need to pass the user id as parameter to get the email \n *DELIVERY*      Check if a particular delivery is available in GLS \n *DD_RPT*         Get the DD reports for a particular DC \n *PSG*                 Get the process details \n *ITEM*               Check if the item is available \n *EOD*                Get the end of the day data \n\nEnter your request in this format : \n *<KEYWORD> <DC NUMBER> <COUNTRY CODE> <PARAMS(OPTIONAL)>* \nEx : PO 32856 US 0022736000,0022736070 ",
                "title": "KEYWORD     WHAT IT DOES "
            }
        ]
    });
});

controller.hears(['printer'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.startConversation(message, function (err, convo) {

        convo.ask('Do you have issue with existing/New Printer?', [
            {
                pattern: bot.utterances.yes,
                callback: function (response, convo) {
                    convo.say('Please share the below details!');
                    convo.ask('Printer Name/Nbr ?', function (response, convo) {
                        convo.next();
                    }, { 'key': 'name' }); // store the results in a field called name
                    convo.ask('Printer IP ?', function (response, convo) {
                        convo.next();
                    }, { 'key': 'ip' }); // store the results in a field called ip
                    convo.ask('Printer MAC Address ?', function (response, convo) {
                        convo.next();
                    }, { 'key': 'mac' }); // store the results in a field called mac
                    convo.on('end', function (convo) {

                        if (convo.status == 'completed') {
                            controller.storage.users.get(message.user, function (err, user) {
                                if (!user) {
                                    user = {
                                        id: message.user,
                                    };
                                }
                                user.name = convo.extractResponse('name');
                                user.ip = convo.extractResponse('ip');
                                user.mac = convo.extractResponse('mac');
                                controller.storage.users.save(user, function (err, id) {
                                    bot.reply(message, 'Printer Name :' + user.name);
                                    bot.reply(message, 'Printer IP :' + user.ip);
                                    bot.reply(message, 'MAC :' + user.mac);


                                    bot.startConversation(message, function (err, convo) {
                                        if (!err) {
                                            convo.say('If you have issue with any other printers , type "printer" else we will work with printer team for the issue reported!');
                                        }
                                    });
                                });
                            });
                        } else {
                            // this happens if the conversation ended prematurely for some reason
                            bot.reply(message, 'OK, nevermind!');
                        }
                    });
                    convo.next();
                }
            },
            {
                pattern: bot.utterances.no,
                default: true,
                callback: function (response, convo) {
                    convo.say('*Ok , Bye!*');
                    convo.next();
                }
            }
        ]);
    });
});



controller.hears(['hello', 'hi'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.api.users.info({ user: message.user }, function (err, response) {
        if (err) {
            bot.say("ERROR :(");
        }
        else {
            user = response["user"].real_name;
            // emailid = response["user"].profile.email;
            bot.reply(message,
                {
                    // text: 'Hello ' + user +" "+ emailid
                    text: 'Hello ' + user
                }
            );
        }
    });

});

controller.hears(['uptime', 'identify yourself', 'who are you', 'what is your name'],
    'direct_message,direct_mention,mention', function (bot, message) {

        var hostname = os.hostname();
        var uptime = formatUptime(process.uptime());

        bot.reply(message,
            ':robot_face: I am a bot named <@' + bot.identity.name +
            '>. I have been running for ' + uptime + ' on ' + hostname + '.');

    });

controller.hears(['add_dc'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.api.users.info({ user: message.user }, function (err, response) {
        if (err) {
            bot.say("ERROR :(");
        }
        else {
            var user = response["user"].profile.display_name;
            var fsNew = require('fs');
            var AdminTxt = fsNew.readFileSync("Admin.txt").toString('utf-8');
            var res1 = AdminTxt.match(user)
            if (res1 == null) {
                text = " You need admin role to Run this command  !!! ";
                bot.reply(message, { "text": "```" + text + "```" });
                Flag = false
            }
            else {

                var inp = message.text;
                var Flag = true;
                var ValFlag = true;
                var warnmsg = "";
                res = inp.split(' ')
                var re = /^[1-9][0-9]{3}$/
                if (res[1].search(re) !== 0) {
                    warnmsg = warnmsg + "Maybe you want to re check the entered DC Number : " + res[1] + "\n";
                    ValFlag = false
                }

                var re2 = /us|cl|br|mx|cn|cr|jp|uk|ca|ni|hn|gt|ar/i
                if (res[2].search(re2) !== 0) {
                    warnmsg = warnmsg + 'I have not heard of the country : ' + res[2] + "\n";
                    ValFlag = false
                }
                if (ValFlag) {
                    var d = new Date();
                    var log_ts = d.toJSON();
                    CC = res[2].toUpperCase();
                    det = res[1] + CC
                    fsNew.exists("dcList.txt", function (exists) {
                        if (exists) {
                            var fileTxt = fsNew.readFileSync("dcList.txt").toString('utf-8');
                            var result = fileTxt.match(det)
                            if (result != null) {
                                bot.reply(message, 'DC/CC Already Present in the List : ' + res[1] + " " + CC + "\n");
                                Flag = false
                            }
                            if (Flag) {
                                addDc("\n" + det + "\n");
                                bot.reply(message, "DC Added Successfully : " + res[1] + " " + CC);
                                writeLog(log_ts + "|" + user + "| Added the DC : " + res[1] + " " + CC + "\n");
                            }
                        } else {
                            addDc(det + "\n");
                            bot.reply(message, "DC Added Successfully : " + res[1] + " " + CC);
                        }
                    });
                }
                else {
                    bot.reply(message, { "text": "```" + warnmsg + "\nPlease Re-Enter the Values !!!```" });
                }
            }
        }
    });
});

controller.hears(['del_dc'], 'direct_message,direct_mention,mention', function (bot, message) {

    bot.api.users.info({ user: message.user }, function (err, response) {
        if (err) {
            bot.say("ERROR :(");
        }
        else {
            user = response["user"].profile.display_name;
            var fsNew1 = require('fs');
            var AdminTxt = fsNew1.readFileSync("Admin.txt").toString('utf-8');
            var res2 = AdminTxt.match(user)
            if (res2 == null) {
                text = " You need admin role to Run this command  !!!"
                bot.reply(message, { "text": "```" + text + "```" });
                Flag = false
            }
            else {

                var inp = message.text;
                var warnmsg = "";
                var ValFlag1 = true;
                var Flag1 = true;
                res = inp.split(' ')
                var re = /^[1-9][0-9]{3}$/
                if (res[1].search(re) !== 0) {
                    warnmsg = warnmsg + "Maybe you want to re check the entered DC Number : " + res[1] + "\n";
                    ValFlag1 = false
                }
                var re2 = /us|cl|br|mx|cn|cr|jp|uk|ca|ni|hn|gt|ar/i
                if (res[2].search(re2) !== 0) {
                    warnmsg = warnmsg + 'I have not heard of the country : ' + res[2] + "\n";
                    ValFlag1 = false
                }
                if (ValFlag1) {
                    var d = new Date();
                    var log_ts = d.toJSON();
                    CC = res[2].toUpperCase();
                    det = res[1] + CC

                    fsNew1.exists("dcList.txt", function (exists) {
                        if (exists) {
                            var data = fsNew1.readFileSync('dcList.txt', 'utf-8');
                            var result = data.match(det)
                            if (result == null) {
                                bot.reply(message, 'DC/CC Not Present in the List : ' + res[1] + " " + CC + "\n");
                                Flag1 = false
                            }
                            if (Flag1) {
                                var newValue = data.replace((det), '');
                                var finalvalue = newValue.replace(/(^[ \t]*\n)/gm, "")
                                fsNew1.writeFileSync('dcList.txt', finalvalue, 'utf-8');
                                bot.reply(message, "DC Removed Successfully : " + res[1] + " " + CC);
                                writeLog(log_ts + "|" + user + "| Removed the DC : " + res[1] + " " + CC + "\n");
                            }
                        } else {
                            bot.reply(message, "Input File Not Present");
                        }
                    });
                }
                else {
                    bot.reply(message, { "text": "```" + warnmsg + "\nPlease Re-Enter the Values !!!```" });
                }
            }
        }
    });
});

function formatUptime(uptime) {
    var unit = 'second';
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'minute';
    }
    if (uptime > 60) {
        uptime = uptime / 60;
        unit = 'hour';
    }
    if (uptime != 1) {
        unit = unit + 's';
    }

    uptime = uptime + ' ' + unit;
    return uptime;
}

function sleep(milliseconds) {
    var start = new Date().getTime();
    for (var i = 0; i < 1e7; i++) {
        if ((new Date().getTime() - start) > milliseconds) {
            break;
        }
    }
}

function printer(response) {

    return response;
}
