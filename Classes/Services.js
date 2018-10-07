const Services = {
  gpio: {
    addNumbers({ num1, num2 }) {
      const promise = new Promise(resolve => {
        setTimeout(() => {
          resolve(num1 + num2);
        }, 300);
      });
      return promise;
    }
  },

  releay: {
    addNumbers({ num1, num2 }) {
      const promise = new Promise(resolve => {
        setTimeout(() => {
          resolve(num1 + num2);
        }, 300);
      });
      return promise;
    }
  }
};
module.exports = Services;
