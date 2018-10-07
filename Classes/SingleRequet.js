class ReqRes {
  constructor({ ms }) {
    this.timeMs = 60000 || ms;
    this.startRequestTimeout(this.timeMs);
    this.onResponce = {};
  }

  startRequestTimeout(timeMs) {
    this.timeout = new setTimeout(() => {
      this.stopRequestTimeout();
      throw new Error("no Responce");
    }, timeMs);
  }

  stopRequestTimeout() {
    clearTimeout(this.timeout);
    delete this;
  }
}

module.exports = ReqRes;
