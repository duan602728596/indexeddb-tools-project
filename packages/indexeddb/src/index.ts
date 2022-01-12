import InitDB, { type CallbackObject } from './InitDB';

/**
 * 初始化数据库
 * @param { string } name            创建或者连接的数据库名
 * @param { number } version         数据库版本号
 * @param { object } callbackObject  配置回调函数
 *   - success                       创建或者连接的数据库成功后的回调函数
 *   - error                         创建或者连接的数据库失败后的回调函数
 *   - upgradeneeded                 数据库版本号更新后的回调函数
 */
export function IndexedDB(name: string, version: number, callbackObject: CallbackObject): InitDB {
  return new InitDB({
    name,
    version,
    callbackObject
  });
}

/**
 * 删除数据库
 * @param { string } databaseName: 数据库名
 */
export function deleteDatabase(databaseName: string): IDBOpenDBRequest {
  return InitDB.idbFactory().deleteDatabase(databaseName);
}

IndexedDB.deleteDatabase = deleteDatabase;

export default IndexedDB;