module.exports = {
  Mysql: {
    host: "localhost",
    user: "root",
    password: "",
    database: "jedm",
  },
  Mssql: {
    server: "MYPC\\SQLEXPRESS01",
    user: "node",
    password: "1qw2!QW@",
    database: "jedm",
    port: 1433,

    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
  Mongodb: {
    url: "mongodb://localhost:27017",
    database: "jedm",
  },
};
