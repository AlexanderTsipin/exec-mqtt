This is a simple mqtt publish / subscribe  request / replay pattern

BUILD IN PROGRESS, 
WILL UPDATE SOON

## About
Mqtt-exec allows to execute commands on local/remote servers.

## How to use

mqttClient.exec(tipic,params,meta)
* topic: /client/name/.... method.method....*
* params: params 
* meta (optional) : timeout - to set custom request timeout


<a name="install"></a>
## Installation
```sh
npm install exec-mqtt --save
```

<a name="example"></a>
## Example
In example below we require an "request-promise" library just for example
you can set it to any objects.

Simple Example:

```js
const mqtt = require("exec-mqtt");

const clientConnectionParams = {
  services: {rp: require('request-promise')},
  name: 'Client1',
  mqttSetting: { 
    url: "mqtt://localhost",
    port: 1883
  }
};


const mqttClient = new mqtt(clientConnectionParams);

mqttClient.init().then(client => {
    mqttClient
    .exec("Client1/rp.get", {uri: "https://restcountries.eu/rest/v2/all"} , {timeout:  5555})
    .then(res => {
      console.log(res)
    });
  });



```
