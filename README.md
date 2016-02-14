# mqttweb

[![Join the chat at https://gitter.im/pwcremin/mqttweb](https://badges.gitter.im/pwcremin/mqttweb.svg)](https://gitter.im/pwcremin/mqttweb?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Examples of how to use IBM's Node-Red and IoT Foundation in your web apps.  Examples are written using React.

Login - Just select a username and a device is created for you.  With this you are able to send mqtt messages to the server.

Highscore board - Just add a player and their score.  Will auto update for all users.

Chat - Send text and watch it update for all users.  By creating a Node-Red http endpoint that uses Watson Text to Speech, each chat message is automatically turned into audio.
https://github.com/watson-developer-cloud/node-red-labs/blob/master/basic_examples/text_to_speech/tts_lab_basic.json

Image Analysis - analize an image - duh
https://github.com/watson-developer-cloud/node-red-labs/blob/master/advanced_examples/alchemy_image_analysis_thumbs/alchvis_lab_webfaces_thumbs.json

Note that the IoT Foundation uses MQTT over ports 1883 or 8883, which must not be blocked by your firewall.
