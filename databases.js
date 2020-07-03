module.exports = {
  Mysql: {
    host: "localhost",
    user: "root",
    password: "",
    database: "jedm",
  },
  Mssql: {
    server: "MYPC\\SQLEXPRESS01",
    user: "sa",
    password: "123",
    database: "jedm",
    // options: {
    //   // encrypt: true,
    //   trustServerCertificate: false,
    // },
  },
  Mongodb: {
    url: "mongodb://localhost:27017",
    database: "jedm",
  },
};
