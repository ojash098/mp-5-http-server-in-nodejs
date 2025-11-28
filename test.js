obj = {
  put: {},
  get: {},
  delete: {},
  post: {},
  example: 123,
};

const method = "put";
obj[method] = {
  example: (a) => {
    console.log("Example route", a);
  },
};

console.log(obj["example"]);
