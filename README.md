# mqttweb

[![Join the chat at https://gitter.im/pwcremin/mqttweb](https://badges.gitter.im/pwcremin/mqttweb.svg)](https://gitter.im/pwcremin/mqttweb?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

Examples of how to use IBM's Node-Red and IoT Foundation in your web apps.  Examples are written using React.

### User Management 
Just select a username and a device is created for you.  With this you are able to send mqtt messages to the server.

### High Score Board
Just add a player and their score.  Will auto update for all users.

Import the below json to create the nodes for this project:
```
[{"id":"f801d1e2.07fe3","type":"ibmiot","z":"1e95840b.2a098c","name":"a2g6k39sl6r5"},{"id":"5aa2b371.a55d4c","type":"function","z":"1e95840b.2a098c","name":"score sort","func":"node.warn('score called')\n\nvar score = msg.payload.score;\nvar player = msg.payload.player;\n\n//context.set('scores', []);\nvar scores = context.get('scores') || [];\n\nscores.push({\"player\": player, \"score\": score})\n\n\nfunction sortScore(a,b) {return b.score - a.score}\nscores = scores.sort(sortScore)\n\n// only track the top 10\nscores = scores.slice(0,10)\n\ncontext.set('scores', scores);\n\nmsg.eventOrCommandType = \"highscore\";\nmsg.payload = JSON.stringify({\"scores\": scores});\n\nreturn msg;","outputs":1,"noerr":0,"x":324,"y":359,"wires":[["b88a5806.4775a8"]]},{"id":"f4af216.f0b50e","type":"ibmiot in","z":"1e95840b.2a098c","authentication":"boundService","apiKey":"f801d1e2.07fe3","inputType":"evt","deviceId":"web1","applicationId":"","deviceType":"+","eventType":"score","commandType":"","format":"json","name":"add score","service":"registered","allDevices":true,"allApplications":"","allDeviceTypes":true,"allEvents":false,"allCommands":"","allFormats":false,"x":70,"y":305,"wires":[["7ca3868c.835c78"]]},{"id":"7ca3868c.835c78","type":"function","z":"1e95840b.2a098c","name":"activate","func":"var deviceId = msg.deviceId;\n\nvar globalContext = context.global;\n\nvar activeDevices = globalContext.get('activeDevices') || [];\n\nvar deviceActive = false\nfor ( var i = 0; i < activeDevices.length; i++ ) \n{\n    if( deviceId === activeDevices[ i ])\n    {\n        deviceActive = true;\n        break;\n    }\n}\n\nif(!deviceActive)\n{\n    node.warn(\"Activate: \" + deviceId);\n\n    activeDevices.push(deviceId);   \n}\n\nglobalContext.set('activeDevices', activeDevices);    \n\nnode.warn(\"Active devices: \" + activeDevices.length);\n\nreturn msg;","outputs":1,"noerr":0,"x":156,"y":360,"wires":[["5aa2b371.a55d4c"]]},{"id":"1584e617.ea7b1a","type":"ibmiot out","z":"1e95840b.2a098c","authentication":"boundService","apiKey":"","outputType":"cmd","deviceId":"web1","deviceType":"tanks","eventCommandType":"highscore","format":"json","data":"{\"d\":{\"value\":\"text\"}}","name":"IBM IoT","service":"registered","x":745,"y":359,"wires":[]},{"id":"b88a5806.4775a8","type":"function","z":"1e95840b.2a098c","name":"send to all devices","func":"var globalContext = context.global;\n\nvar activeDevices = globalContext.get('activeDevices') || [];\n\nfor(var i=0; i < activeDevices.length; i++)\n{\n    var newMsg = msg;\n    newMsg.deviceId = activeDevices[i];\n    //node.warn('sending to: ' + newMsg.deviceId)\n    node.send(newMsg);\n}\n\nreturn null;","outputs":1,"noerr":0,"x":522.5,"y":359,"wires":[["1584e617.ea7b1a"]]}]
```
### Chat with Watson Text to Speech
Send text and watch it update for all users.  By creating a Node-Red http endpoint that uses Watson Text to Speech, each chat message is automatically turned into audio.

Import the below json to create the nodes for this project:
```json
[{"id":"f801d1e2.07fe3","type":"ibmiot","z":"1e95840b.2a098c","name":"a2g6k39sl6r5"},{"id":"5aa2b371.a55d4c","type":"function","z":"1e95840b.2a098c","name":"score sort","func":"node.warn('score called')\n\nvar score = msg.payload.score;\nvar player = msg.payload.player;\n\n//context.set('scores', []);\nvar scores = context.get('scores') || [];\n\nscores.push({\"player\": player, \"score\": score})\n\n\nfunction sortScore(a,b) {return b.score - a.score}\nscores = scores.sort(sortScore)\n\n// only track the top 10\nscores = scores.slice(0,10)\n\ncontext.set('scores', scores);\n\nmsg.eventOrCommandType = \"highscore\";\nmsg.payload = JSON.stringify({\"scores\": scores});\n\nreturn msg;","outputs":1,"noerr":0,"x":324,"y":399,"wires":[["b88a5806.4775a8"]]},{"id":"f4af216.f0b50e","type":"ibmiot in","z":"1e95840b.2a098c","authentication":"boundService","apiKey":"f801d1e2.07fe3","inputType":"evt","deviceId":"web1","applicationId":"","deviceType":"+","eventType":"score","commandType":"","format":"json","name":"add score","service":"registered","allDevices":true,"allApplications":"","allDeviceTypes":true,"allEvents":false,"allCommands":"","allFormats":false,"x":70,"y":345,"wires":[["7ca3868c.835c78"]]},{"id":"fb5be361.04a42","type":"function","z":"1e95840b.2a098c","name":"Set headers","func":"// Set the content type to audio wave\nmsg.headers={ 'Content-Type': 'audio/wav'};\nreturn msg;","outputs":1,"noerr":0,"x":379,"y":662,"wires":[["dfc261bc.203da"]]},{"id":"4f030a9.fb0fcf4","type":"http in","z":"1e95840b.2a098c","name":"","url":"/tts/sayit","method":"get","swaggerDoc":"","x":83,"y":554,"wires":[["cf74a597.308b58"]]},{"id":"cf74a597.308b58","type":"change","z":"1e95840b.2a098c","name":"text to payload","rules":[{"t":"set","p":"payload","to":"payload.text_to_say","tot":"msg"}],"action":"","property":"","from":"","to":"","reg":false,"x":254,"y":490,"wires":[["89388215.76c78"]]},{"id":"89388215.76c78","type":"watson-text-to-speech","z":"1e95840b.2a098c","name":"","lang":"english","voice":"en-US_MichaelVoice","x":309,"y":553,"wires":[["6d87852f.92787c"]]},{"id":"6d87852f.92787c","type":"change","z":"1e95840b.2a098c","name":"speech to payload","rules":[{"t":"set","p":"payload","to":"msg.speech"}],"action":"","property":"","from":"","to":"","reg":false,"x":349,"y":607,"wires":[["fb5be361.04a42"]]},{"id":"dfc261bc.203da","type":"http response","z":"1e95840b.2a098c","name":"","x":564,"y":552,"wires":[]},{"id":"7ca3868c.835c78","type":"function","z":"1e95840b.2a098c","name":"activate","func":"var deviceId = msg.deviceId;\n\nvar globalContext = context.global;\n\nvar activeDevices = globalContext.get('activeDevices') || [];\n\nvar deviceActive = false\nfor ( var i = 0; i < activeDevices.length; i++ ) \n{\n    if( deviceId === activeDevices[ i ])\n    {\n        deviceActive = true;\n        break;\n    }\n}\n\nif(!deviceActive)\n{\n    node.warn(\"Activate: \" + deviceId);\n\n    activeDevices.push(deviceId);   \n}\n\nglobalContext.set('activeDevices', activeDevices);    \n\nnode.warn(\"Active devices: \" + activeDevices.length);\n\nreturn msg;","outputs":1,"noerr":0,"x":156,"y":400,"wires":[["5aa2b371.a55d4c"]]},{"id":"1584e617.ea7b1a","type":"ibmiot out","z":"1e95840b.2a098c","authentication":"boundService","apiKey":"","outputType":"cmd","deviceId":"web1","deviceType":"tanks","eventCommandType":"highscore","format":"json","data":"{\"d\":{\"value\":\"text\"}}","name":"IBM IoT","service":"registered","x":745,"y":399,"wires":[]},{"id":"b88a5806.4775a8","type":"function","z":"1e95840b.2a098c","name":"send to all devices","func":"var globalContext = context.global;\n\nvar activeDevices = globalContext.get('activeDevices') || [];\n\nfor(var i=0; i < activeDevices.length; i++)\n{\n    var newMsg = msg;\n    newMsg.deviceId = activeDevices[i];\n    //node.warn('sending to: ' + newMsg.deviceId)\n    node.send(newMsg);\n}\n\nreturn null;","outputs":1,"noerr":0,"x":522.5,"y":399,"wires":[["1584e617.ea7b1a"]]}]
```
### Candidate Tweet Sentiment Analysis

```
[{"id":"f801d1e2.07fe3","type":"ibmiot","z":"1e95840b.2a098c","name":"a2g6k39sl6r5"},{"id":"25f6707e.da099","type":"twitter in","z":"1e95840b.2a098c","twitter":"","tags":"@berniesanders,@realDonaldTrump,@HillaryClinton,@JebBush,@tedcruz","user":"false","name":"politicians","topic":"tweets","x":76.5,"y":806,"wires":[["9c79e5b6.638618"]]},{"id":"9c79e5b6.638618","type":"function","z":"1e95840b.2a098c","name":"set candidate","func":"var text = msg.tweet.text;\nvar candidates = ['@JohnKasich', '@BernieSanders','@realDonaldTrump','@HillaryClinton','@JebBush','@tedcruz'];\nvar tweets = context.flow.get('tweets') || {};\n\nfor (var i = 0; i < candidates.length; i++)\n{\n    var candidate = candidates[i];\n    if(text.indexOf(candidate) !== -1)\n    {\n        msg.payload = text;\n        msg.candidate = candidate;\n        \n        if(!tweets[candidate])\n        {\n            tweets[candidate] = {\n                text: \"\",\n                count: 0\n            }\n        }\n        \n        tweets[candidate].text += \" \" + text;\n        tweets[candidate].count++;\n    }\n}\n\ncontext.flow.set('tweets', tweets);\n\nreturn msg;","outputs":1,"noerr":0,"x":149.5,"y":865,"wires":[["b26ed73c.4d9128"]]},{"id":"b26ed73c.4d9128","type":"switch","z":"1e95840b.2a098c","name":"candidate","property":"candidate","propertyType":"msg","rules":[{"t":"eq","v":"@BernieSanders","vt":"str"},{"t":"eq","v":"@realDonaldTrump","vt":"str"},{"t":"eq","v":"@HillaryClinton","vt":"str"},{"t":"eq","v":"@JebBush","vt":"str"},{"t":"eq","v":"@tedcruz","vt":"str"},{"t":"eq","v":"@JohnKasich","vt":"str"}],"checkall":"true","outputs":6,"x":157.5,"y":956,"wires":[["68051686.97fae8"],["68051686.97fae8"],["68051686.97fae8"],["68051686.97fae8"],["68051686.97fae8"],["68051686.97fae8"]]},{"id":"ecc9966b.133668","type":"sentiment","z":"1e95840b.2a098c","name":"","x":591,"y":953,"wires":[["adaaf883.525508"]]},{"id":"adaaf883.525508","type":"function","z":"1e95840b.2a098c","name":"set candidateScores","func":"//context.set('candidateScores', {});\nvar candidateScores = context.get('candidateScores') || {};\nvar tweets = context.flow.get('tweets');\n\nif(!candidateScores[msg.candidate])\n{\n    candidateScores[msg.candidate] = \n    {\n        candidate: msg.candidate,\n        tweetCount: 0,\n        lastUpdate: Date.now(),\n        window: [],\n        movingAverage: 0\n    }\n}\n\ncandidateScores[msg.candidate].tweetCount = tweets[msg.candidate].count;\n\n// set the count to 0 so that it can start building up for the next batch\ntweets[msg.candidate].count = 0;\ncontext.flow.set('tweets', tweets);\n\ncandidateScores[msg.candidate].window.push(msg.sentiment.score);\n\nvar MAX_WINDOW_SIZE = 300;\ncandidateScores[msg.candidate].window = candidateScores[msg.candidate].window.slice(candidateScores[msg.candidate].window.length - MAX_WINDOW_SIZE);\n\nvar sum = 0;\nfor(var i = 0; i < candidateScores[msg.candidate].window.length; i++)\n{\n    sum += candidateScores[msg.candidate].window[i];\n}\n\nvar movingAverage = sum/candidateScores[msg.candidate].window.length;\n\nnode.warn(msg.candidate + ' MA: ' + movingAverage)\ncandidateScores[msg.candidate].movingAverage = movingAverage; \ncontext.set('candidateScores', candidateScores);\n\nmsg.payload = JSON.stringify(candidateScores[msg.candidate]);\n\nreturn msg;","outputs":1,"noerr":0,"x":801.5,"y":953,"wires":[["4bb0f5ff.b44f0c"]]},{"id":"4bb0f5ff.b44f0c","type":"function","z":"1e95840b.2a098c","name":"send to all devices","func":"var globalContext = context.global;\n\nvar activeDevices = globalContext.get('activeDevices') || [];\n\nfor(var i=0; i < activeDevices.length; i++)\n{\n    var newMsg = msg;\n    newMsg.deviceId = activeDevices[i];\n    //node.warn('sending to device: ' + newMsg.deviceId);\n    node.send(newMsg);\n}\n\nreturn null;","outputs":1,"noerr":0,"x":804,"y":1011,"wires":[["698b6449.96749c"]]},{"id":"698b6449.96749c","type":"ibmiot out","z":"1e95840b.2a098c","authentication":"boundService","apiKey":"f801d1e2.07fe3","outputType":"cmd","deviceId":"all","deviceType":"tanks","eventCommandType":"candidateScores","format":"json","data":"{\"d\":{\"value\":\"text\"}}","name":"IBM IoT","service":"registered","x":803.5,"y":1071,"wires":[]},{"id":"68051686.97fae8","type":"function","z":"1e95840b.2a098c","name":"tweet delay","func":"var lastUpdateKey = msg.candidate + 'lastUpdate';\n\nvar lastUpdate = context.get(lastUpdateKey) || Date.now();\nvar tweets = context.flow.get('tweets');\n\nvar TWEET_DELAY = 10000;\n\nif(Date.now() - lastUpdate > TWEET_DELAY)\n{\n    lastUpdate = Date.now();\n    \n    msg.payload = tweets[msg.candidate].text;\n    \n    tweets[msg.candidate].text = \"\";\n    context.flow.set('tweets', tweets);\n}\nelse\n{\n    // do not send a message on\n    msg = null;\n}\n\ncontext.set(lastUpdateKey, lastUpdate);\nreturn msg;","outputs":1,"noerr":0,"x":380.5,"y":954,"wires":[["ecc9966b.133668"]]}]
```
Note that the IoT Foundation uses MQTT over ports 1883 or 8883, which must not be blocked by your firewall.
