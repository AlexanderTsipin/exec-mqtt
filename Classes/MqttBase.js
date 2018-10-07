const mqtt = require("mqtt");

class MqttBase {
  constructor() {
    this.client = {};
    this.bridgeClient = {};
  }

  startBridge(bridge) {
    if (bridge) bridge.map(bridgMqtt => this.bridge(bridgMqtt));
  }

  sendMqttMessage(payload, message) {
    let msg = "";
    // stringify message before send
    if (typeof message === "object") msg = JSON.stringify(message);
    // send message
    this.client.publish(payload, msg);
  }

   parseTopic(topic){
    return {
        methods : topic.split("/")[topic.split("/").length-1].split("."),
        device : topic.substring(0, topic.lastIndexOf("/")+1)
    }
  }

  callMethod(execMethod , params = {a:23}){
    let command = this.services
    execMethod.map(metod=>command = command[metod])
    return command(params)
  }

  startLocalClient(mqttUrl, topic) {
    return new Promise(resolve => {
      // create mqtt client
      this.mqttCreate(mqttUrl, topic)
        // assign client to this.client
        .then(client => {
          this.client = client;
          resolve(client);
        });
    });
  }

  mqttCreate(mqttUrl, topic) {
    this.a = 5;
    // connect&subscribe return mqtt instance
    return new Promise((resolve, reject) => {
      const mqttClient = mqtt.connect(mqttUrl);
      let thisTopic = `${topic}/#`;
      if (topic === "#") thisTopic = "#";
      mqttClient.on("connect", () => {
        mqttClient.subscribe(
          thisTopic,
          {
            qos: 2
          },
          err => {
            if (err) reject(err);
            resolve(mqttClient);
          }
        );
      });
    });
  }

  addBrigde(mqttSourceSettings, mqttTargetSettings) {
    let sourceBridge = {};
    let targetBridge = {};
    return new Promise((resolve, reject) => {
      this.mqttCreate(mqttSourceSettings, mqttTargetSettings.name)
        .then(sB => {
          sourceBridge = sB;
          return this.mqttCreate(mqttTargetSettings, mqttSourceSettings.name);
        })
        .then(tB => {
          targetBridge = tB;

          sourceBridge.on("message", (topic, message) => {
            targetBridge.publish(topic, message);
          });
          targetBridge.on("message", (topic, message) => {
            sourceBridge.publish(topic, message);
          });
          resolve();
        })
        .catch(e => {
          reject(e);
        });
    });
  }
}

module.exports = MqttBase;
