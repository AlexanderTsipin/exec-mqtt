const MqttBase = require("./MqttBase");
const ReqRes = require("./SingleRequet");

class MqttExec extends MqttBase {
  constructor({ services, name, mqttSetting }) {
    super();
    this.services = services;
    this.queueRequests = {};
    this.mqttSetting = mqttSetting;
    this.name = name;
  }

  init() {
    // init local client
    return this.startLocalClient(this.mqttSetting, this.name).then(() => {
      this.client.on("message", (topic, message) => {
        let msg = message;
        if (typeof msg === "object");
        msg = JSON.parse(msg.toString());
        msg.topic = topic;
        this.messageHandler(msg);
      });
    });
  }

  messageHandler(req) {
    // handle messages by status
    this.statusActions()[req.meta.status](req);
  }

  runExecuteStatus(topic, params, meta = { timeout: 5000 }) {
    const pMeta = meta;
    // set default timeout
    const payload = {
      params,
      meta: pMeta,
      topic
    };
    const metaData = {
      sender: this.name,
      uuid: Math.floor(Math.random() * 99999999999999999).toString(),
      status: "execute"
    };
    payload.meta = Object.assign(metaData, payload.meta);
    // send message
    this.sendMqttMessage(topic, payload);
    this.queueRequests[metaData.uuid] = new ReqRes({
      ms: payload.meta.timeout
    });
    return payload;
  }

  runResultStatus(uuid) {
    return new Promise(resolve => {
      // on responce event
      this.queueRequests[uuid].onResult = resultPayload => {
      // resolve request
        resolve(resultPayload);
        this.queueRequests[uuid].stopRequestTimeout();
        delete this.queueRequests[uuid];
      };
      // on responce event
    });
  }

  // execute command
  run(topic, params, meta) {
    const payload = this.runExecuteStatus(topic, params, meta);
    return this.runResultStatus(payload.meta.uuid);
  }

  statusActions() {
    return {
      //* *********************EXECUTE STATUS**************************************
      execute: req => {
        // parse topic to execution path device/class/functionName
        // execute command
        const { host, className, func } = this.parsePayloadToPath(req.topic);
        return this.services[className][func]
          .call(this.services, req.params)
          .then(result => {
            // send result message
            req.result = result;
            // update status to process result message
            req.meta.status = "result";
            // change topic.host to sender.host
            const topic = [req.meta.sender, "reply", "heandler"].join("/");
            req.meta.topic = topic;
            this.sendMqttMessage(topic, req);
          });
      },
      //* *********************EXECUTE STATUS**************************************

      //* *********************RESULT STATUS**************************************
      result: req => {
        if (this.queueRequests[req.meta.uuid]) {
          this.queueRequests[req.meta.uuid].onResult(req.result);
          delete this.queueRequests[req.meta.uuid];
        }
      }
      //* *********************RESULT STATUS**************************************
    };
  }
}

module.exports = MqttExec;
