const mqtt = require("../main");

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
    mqttClient.exec("Client1/rp/get", {uri: "https://restcountries.eu/rest/v2/all"} , {timeout:  5555})
    .then(res => {
      console.log(res)
    });
  });

