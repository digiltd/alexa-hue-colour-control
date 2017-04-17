// source https://developers.meethue.com/content/rgb-hue-color0-65535-javascript-language

var red = msg.payload.state.red;
var green = msg.payload.state.green;
var blue = msg.payload.state.blue;

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

if (isNaN(x))
    x = 0;

if (isNaN(y))
    y = 0;

msg.payload.state.x = x;
msg.payload.state.y = y;
return msg;
