import * as SQLite from "expo-sqlite";
import { CREATE_TABLES } from "./schema";

let _db: SQLite.SQLiteDatabase | null = null;

export async function getDB(): Promise<SQLite.SQLiteDatabase> {
  if (_db) return _db;

  _db = await SQLite.openDatabaseAsync("medetect.db");
  await _db.execAsync(CREATE_TABLES);

  console.log("Database ready.");
  return _db;
}
