module.exports = {
  Mysql: {
    host: "localhost",
    user: "root",
    password: "",
    database: "jedm",
  },
  Mssql: {
    server: "107.180.90.24",
    user: "northwindDBAdminDev",
    password: "p1sswOrdDev",
    database: "NorthwindDev",
    port: 1433,

    options: {
      trustServerCertificate: true,
    },
  },
  MssqlW: {
    server: "MYPC\\SQLEXPRESS01",
    driver: "msnodesqlv8",
    database: "jedm",
    port: 1433,

    options: {
      trustedConnection: true,
      trustServerCertificate: true,
    },
  },
  Mongodb: {
    url: "mongodb://localhost:27017",
    database: "jedm",
    useUnifiedTopology: true,
  },
};
