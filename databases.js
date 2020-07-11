module.exports = {
  Mysql: {
    host: "107.180.90.24",
    user: "WahidTechAdmin",
    password: "WTdb@1649",
    database: "sakila",
  },
  Mssql: {
    server: "107.180.90.24",
    user: "northwindDBAdminDev",
    password: "p1sswOrdDev",
    database: "NorthwindDev",
    port: 1433,
    pool: {
      idleTimeoutMillis: 6000000,
    },
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
