/**
 * Alexa Hue Colour Control
 * Created by Sam Turner, Feb 2017
 */

var Alexa = require('alexa-sdk');
var request = require('request');


var hueURL = "https://proxy-address-to-open-port.com/api/hue-userID/groups/2/action";

// valid hue slot stuff
var coloursJson = {"white": "#ffffff", "very light gray": "#e8e8e8", "very light bluish gray": "#e4e8e8", "light bluish gray": "#afb5c7", "light gray": "#9c9c9c", "dark gray": "#6b5a5a", "dark bluish gray": "#595d60", "black": "#212121", "dark red": "#6a0e15", "red": "#b30006", "rust": "#b52c20", "salmon": "#f45c40", "light salmon": "#ffdedc", "sand red": "#8c6b6b", "reddish brown": "#89351d", "brown": "#532115", "dark brown": "#330000", "dark tan": "#907450", "tan": "#dec69c", "light flesh": "#feccb0", "flesh": "#cc8062", "medium dark flesh": "#e78b3e", "dark flesh": "#774125", "fabuland brown": "#b3694e", "fabuland orange": "#ef9121", "earth orange": "#e6881d", "dark orange": "#b35408", "neon orange": "#fa5947", "orange": "#ff7e14", "medium orange": "#ffa531", "bright light orange": "#f7ba30", "light orange": "#f7ad63", "very light orange": "#e6c05d", "dark yellow": "#dd982e", "yellow": "#f7d117", "bright light yellow": "#f3e055", "light yellow": "#ffe383", "light lime": "#ebee8f", "yellowish green": "#dfeea5", "neon green": "#bcef66", "medium lime": "#bdc618", "lime": "#a6ca55", "olive green": "#7c9051", "dark green": "#2e5543", "green": "#00642e", "bright green": "#10cb31", "medium green": "#62f58e", "light green": "#a5dbb5", "sand green": "#76a290", "dark turquoise": "#008a80", "light turquoise": "#31b5ca", "aqua": "#b5d3d6", "light aqua": "#ccffff", "dark blue": "#143044", "blue": "#0057a6", "dark azure": "#3399ff", "medium azure": "#42c0fb", "medium blue": "#61afff", "maersk blue": "#6badd6", "bright light blue": "#9fc3e9", "light blue": "#b4d2e3", "sky blue": "#7dbfdd", "sand blue": "#5a7184", "blue-violet": "#506cef", "dark blue-violet": "#2032b0", "violet": "#3448a4", "medium violet": "#9391e4", "light violet": "#c9cae2", "dark purple": "#5f2683", "purple": "#a5499c", "light purple": "#da70d6", "medium lavender": "#885e9e", "lavender": "#b18cbf", "sand purple": "#b57da5", "magenta": "#b52952", "dark pink": "#c87080", "medium dark pink": "#f785b1", "bright pink": "#ffbbff", "pink": "#ffc0cb", "light pink": "#ffe1ff"}
var groupsJson = {"hallway": 1, "office": 2, "living room": 3, "dining room": 4, "kodisavedstate": 5, "living room extra": 6, "downstairs": 7, "bedroom": 8, "back garden": 9 }
var lightsJson = {"ceiling": 1, "front left corner": 2, "desk": 3, "back right corner": 4, "upstairs hall": 5, "downstairs hall": 6, "back left corner": 7, "shelf": 8 }



var handlers = {
    'LaunchRequest': function() {
        this.emit('HelloWorldIntent');
    },


    'HelloWorldIntent': function() {
        this.emit(':tell', 'Hello World!');
    },


    'SendGroupColourValueIntent': function() {
        this.emit('ValidateColour');
    },


    'ValidateColour': function() {
        var intent = this.event.request.intent;
        var colourSlot = this.event.request.intent.slots.ColourValue;
        var colourName;
        // check slot is ok
        if (colourSlot && colourSlot.value) {
            colourName = colourSlot.value.toLowerCase();
        }
        // check colour in slot matches one of the colours in the list
        var allowed = [];
        for (var key in coloursJson) {
            if (coloursJson.hasOwnProperty(key)) {
                allowed.push(key);
            }
        }
        var speechOutput = null;
        var cardTitle = 'Colour list';
        var cardContent = "";
        // list all colours in a card
        if (!intent || allowed.indexOf(colourName) <= -1) {
            speechOutput = "Oops, I don't recognise " + colourName + " as a colour. See the Alexa app for a list of colours.";
            for (var i = 0; i < allowed.length; i++) {
                cardContent += allowed[i] + ", ";
            }
            this.emit(':tellWithCard', speechOutput, cardTitle, cardContent);
        }
        this.emit('ConvertHex2RGB2XY');
    },


    'ConvertHex2RGB2XY': function() {
        var intent = this.event.request.intent;
        var colourSlot = this.event.request.intent.slots.ColourValue;
        var colourName;
        var colourHex;
        // check slot is ok
        if (colourSlot && colourSlot.value) {
            colourName = colourSlot.value.toLowerCase();
        }
        if (colourName in coloursJson) {
            colourHex = coloursJson[colourName];

            var colourR = parseInt(colourHex.slice(1, 3), 16);
            var colourG = parseInt(colourHex.slice(3, 5), 16);
            var colourB = parseInt(colourHex.slice(5), 16);

            console.log("HEX " + colourHex);
            console.log("RGB " + colourR.toString() + "," + colourG.toString() + "," + colourB.toString());
       
            var red = colourR;
            var green = colourG;
            var blue = colourB;
            //Apply a gamma correction to the RGB values, which makes the color more vivid and more the like the color displayed on the screen of your device
            red = (red > 0.04045) ? Math.pow((red + 0.055) / (1.0 + 0.055), 2.4) : (red / 12.92);
            green = (green > 0.04045) ? Math.pow((green + 0.055) / (1.0 + 0.055), 2.4) : (green / 12.92);
            blue = (blue > 0.04045) ? Math.pow((blue + 0.055) / (1.0 + 0.055), 2.4) : (blue / 12.92);
            //RGB values to XYZ using the Wide RGB D65 conversion formula
            var X = red * 0.664511 + green * 0.154324 + blue * 0.162028;
            var Y = red * 0.283881 + green * 0.668433 + blue * 0.047685;
            var Z = red * 0.000088 + green * 0.072310 + blue * 0.986039;
            //Calculate the xy values from the XYZ values
            var x = (X / (X + Y + Z)).toFixed(4);
            var y = (Y / (X + Y + Z)).toFixed(4);
            if (isNaN(x)) {
                x = 0;
            }
            if (isNaN(y)) {
                y = 0;
            }
            this.attributes["colourX"] = x;
            this.attributes["colourY"] = y;
            console.log("X " + x);
            console.log("Y " + y);
        }

        this.emit('ValidateGroup');
    },


    'ValidateGroup': function() {
        var intent = this.event.request.intent;
        var groupSlot = this.event.request.intent.slots.GroupValue;
        var groupName;
        // check slot is ok
        if (groupSlot && groupSlot.value) {
            groupName = groupSlot.value.toLowerCase();
        }
        console.log(' this.attributes["colourXY"] ' + this.attributes["colourXY"]);
        // check colour in slot matches one of the colours in the list
        var allowed = [];
        for (var key in groupsJson) {
            if (groupsJson.hasOwnProperty(key)) {
                allowed.push(key);
            }
        }
        var speechOutput = null;
        var cardTitle = 'Colour list';
        var cardContent = "";
        // list all colours in a card
        if (!intent || allowed.indexOf(groupName) <= -1) {
            speechOutput = "Oops, I don't recognise " + groupName + " as a group. See the Alexa app for a list of groups.";
            for (var i = 0; i < allowed.length; i++) {
                cardContent += allowed[i] + ", ";
            }
            this.emit(':tellWithCard', speechOutput, cardTitle, cardContent);
        }
        this.emit('BuildRequest');
        // this.emit(':tell', ' yay group!');
    },


    'ValidateLight': function() {
        var intent = this.event.request.intent;
        var lightSlot = this.event.request.intent.slots.LightValue;
        var lightName;
        // check slot is ok
        if (lightSlot && lightSlot.value) {
            lightName = lightSlot.value.toLowerCase();
        }
        // check light in slot matches one of the lights in the list
        var allowed = [];
        for (var key in lightsJson) {
            if (lightsJson.hasOwnProperty(key)) {
                allowed.push(key);
            }
        }
        var speechOutput = null;
        var cardTitle = 'Bulb list';
        var cardContent = "";
        // list all colours in a card
        if (!intent || allowed.indexOf(lightName) <= -1) {
            speechOutput = "Oops, I don't recognise " + lightName + " as a light. See the Alexa app for a list of light.";
            for (var i = 0; i < allowed.length; i++) {
                cardContent += allowed[i] + ", ";
            }
            this.emit(':tellWithCard', speechOutput, cardTitle, cardContent);
        }
        this.emit(':tell', ' yay light!');
    },


    'BuildRequest': function() {
        var intX = Number(this.attributes["colourX"]);
        var intY = Number(this.attributes["colourY"]);

        var jsonData = {
            "on": true,
            "xy": [intX, intY]
        };
        request.put({
            url: hueURL,
            json: jsonData
        }, function(error, response, body) {
            console.log('error:', error); 
            console.log('statusCode:', response && response.statusCode);
            console.log('body:', body);
        })
        this.emit(':tell', "done");
    }

};


exports.handler = function(event, context, callback) {
    var alexa = Alexa.handler(event, context);
    alexa.registerHandlers(handlers);
    alexa.execute();
};

