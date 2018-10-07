/* eslint-disable */
const assert = require("assert");

// MQTT SERVER MOCK
const mosca = require("mosca");

let mqttClient = {};
let mqttServer = {};
const serverName = "server35";
const client1Name = "client41";
const mqtt = require("../Classes/mqttReqRes");
const service = require("../Classes/services");

//* ******************************create mqtt instances******************************/
const clientBrokerPort = 3002;

const clientConnectionParams = {
  services: service,
  name: client1Name,
  mqttSetting: {
    url: "mqtt://localhost",
    port: clientBrokerPort
  }
};
const serverBrokerPort = 3001;
const serverConnectionParams = {
  services: service,
  name: serverName,
  mqttSetting: {
    url: "mqtt://localhost",
    port: serverBrokerPort
    //        port:8777
  }
};

//* ******************************create mqtt instances******************************/
describe("send messages tests", function() {
  describe("starting mock servers", function() {
    it("start mock mqtt servers", function(done) {
      let mockServer = new mosca.Server({
        port: serverBrokerPort
      });
      mockServer.on('published', function(packet, client) {
      //  console.log('mockServer Published', packet.payload.toString());
      });
       
      mockServer.on("ready", done());
    });
    it("start mock mqtt client1 server", function(done) {
      let mockclient1 = new mosca.Server({
        port: clientBrokerPort
      });
      mockclient1.on('mockclient1', function(packet, client) {
      //  console.log('mockServer Published', packet.payload.toString());
      });
      mockclient1.on("ready", done());
    });
    // START MOCK SERVER/S
    it("connect client mqtt broker", function(done) {
      mqttClient = new mqtt(clientConnectionParams);
      mqttClient.init().then(client => {
        done();
      });
    });

    it("connect server mqtt broker", function(done) {
      mqttServer = new mqtt(serverConnectionParams);
      mqttServer.init().then(client => {
        done();
      });
    });
  });

  describe("sending messages", function(done) {
    /***************************NORMAL*********************************** */
    it("send from client1 to client1", function(done) {
      mqttClient
        .run(client1Name + "/gpio/addNumbers", {
          num1: 13,
          num2: 3
        } , {timeout:  5555})
        .then(res => {
          assert.equal(13 + 3, res);
          done();
        });
    });

    it("send from server to server", function(done) {
      mqttServer
        .run(serverName + "/gpio/addNumbers", {
          num1: 13,
          num2: 3
        })
        .then(res => {
          assert.equal(13 + 3, res);
          done();
        });
    });
    /***************************NORMAL*********************************** */

    /** *Bridge***/
    it("create bridge", function(done) {
      mqttClient
        .addBrigde(
          { url: "lcalhost", port: 3001, name: serverName },
          { url: "lcalhost", port: 3002, name: client1Name }
        )
        .then(() => {
          done();
        });
    });
    /***Bridge** */

    /***************************CROSS*********************************** */

    it("send from client to server", function(done) {
      this.timeout(5000);
      mqttClient
        .run(serverName + "/gpio/addNumbers", {
          num1: 13,
          num2: 3
        })
        .then(res => {
          assert.equal(13 + 3, res);
          done();
        });
    });

    it("send from server to client", function(done) {
      this.timeout(5000);
      mqttServer
        .run(client1Name + "/gpio/addNumbers", {
          num1: 13,
          num2: 3
        })
        .then(res => {
          assert.equal(13 + 3, res);
          done();
        });
    });

    /** *************************CROSS************************************/
  });
});
//* ******************************create mqtt instances******************************/
