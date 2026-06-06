const { PrismaClient } = require("../generated/prisma"); 
const { PrismaPg } = require("@prisma/adapter-pg");
const pg = require("pg");

require("dotenv").config();

const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false
  }
});

const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

module.exports = prisma;