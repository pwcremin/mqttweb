# mqttweb

[![Join the chat at https://gitter.im/pwcremin/mqttweb](https://badges.gitter.im/pwcremin/mqttweb.svg)](https://gitter.im/pwcremin/mqttweb?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Examples of how to use IBM's Node-Red and IoT Foundation in your web apps.  Examples are written using React.

### User Management 
Just select a username and a device is created for you.  With this you are able to send mqtt messages to the server.

### High Score Board
Just add a player and their score.  Will auto update for all users.

### Chat with Watson Text to Speech
Send text and watch it update for all users.  By creating a Node-Red http endpoint that uses Watson Text to Speech, each chat message is automatically turned into audio.

```json
[{"id":"f801d1e2.07fe3","type":"ibmiot","z":"1e95840b.2a098c","name":"a2g6k39sl6r5"},{"id":"54975308.ab68ac","type":"ibmiot out","z":"1e95840b.2a098c","authentication":"boundService","apiKey":"","outputType":"cmd","deviceId":"web1","deviceType":"tanks","eventCommandType":"highscore","format":"json","data":"{\"d\":{\"value\":\"text\"}}","name":"IBM IoT","service":"registered","x":679,"y":259,"wires":[]},{"id":"ac0cd712.53f328","type":"ibmiot in","z":"1e95840b.2a098c","authentication":"boundService","apiKey":"f801d1e2.07fe3","inputType":"evt","deviceId":"web1","applicationId":"","deviceType":"+","eventType":"chat","commandType":"","format":"json","name":"chat","service":"registered","allDevices":true,"allApplications":"","allDeviceTypes":true,"allEvents":false,"allCommands":"","allFormats":false,"x":69,"y":151,"wires":[["24c9367e.db36ca"]]},{"id":"24c9367e.db36ca","type":"function","z":"1e95840b.2a098c","name":"activate","func":"var deviceId = msg.deviceId;\n\nvar globalContext = context.global;\n\nvar activeDevices = globalContext.get('activeDevices') || [];\n\nvar deviceActive = false\nfor ( var i = 0; i < activeDevices.length; i++ ) \n{\n    if( deviceId === activeDevices[ i ])\n    {\n        deviceActive = true;\n        break;\n    }\n}\n\nif(!deviceActive)\n{\n    node.warn(\"Activate: \" + deviceId);\n\n    activeDevices.push(deviceId);   \n}\n\nglobalContext.set('activeDevices', activeDevices);    \n\nnode.warn(\"Active devices: \" + activeDevices.length);\n\nreturn msg;","outputs":1,"noerr":0,"x":151,"y":206,"wires":[["ff9695a7.006968"]]},{"id":"d48fe199.2b702","type":"function","z":"1e95840b.2a098c","name":"send to all devices","func":"var globalContext = context.global;\n\nvar activeDevices = globalContext.get('activeDevices') || [];\n\nfor(var i=0; i < activeDevices.length; i++)\n{\n    var newMsg = msg;\n    newMsg.deviceId = activeDevices[i];\n    //node.warn('sending to: ' + newMsg.deviceId)\n    node.send(newMsg);\n}\n\nreturn null;","outputs":1,"noerr":0,"x":502.5,"y":256,"wires":[["54975308.ab68ac"]]},{"id":"ff9695a7.006968","type":"function","z":"1e95840b.2a098c","name":"create chat message","func":"\nvar text = msg.payload.text;\nvar id = msg.deviceId;\n\nnode.warn('new chat message: ' + text)\n\nmsg.payload = JSON.stringify({\"id\": id, \"text\": text });\nmsg.eventOrCommandType = 'chat';\n\nreturn msg;","outputs":1,"noerr":0,"x":272.5,"y":256,"wires":[["d48fe199.2b702"]]}]
```

### Candidate Tweet Sentiment Analysis

Note that the IoT Foundation uses MQTT over ports 1883 or 8883, which must not be blocked by your firewall.
