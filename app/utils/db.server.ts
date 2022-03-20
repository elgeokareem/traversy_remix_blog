import { PrismaClient } from "@prisma/client";

/**
 * Este archivo existe para que en desarrollo 
 * no se cree una nueva conexion y tampoco queremos
 * que se resetee el server con cada cambio
 */

let db: PrismaClient;

declare global {
  var __db: PrismaClient | undefined;
}

if (process.env.NODE_ENV === "production") {
  db = new PrismaClient();
  db.$connect();
} else {
  if (!global.__db) {
    global.__db = new PrismaClient();
    global.__db.$connect();
  }

  db = global.__db;
}

export { db }
