import { InitIDB, type CallbackObject } from './InitIDB';

/**
 * 初始化数据库
 * @param { string } name: 创建或者连接的数据库名
 * @param { number } version: 数据库版本号
 * @param { CallbackObject } callbackObject: 配置回调函数
 * @param callbackObject.success: 创建或者连接的数据库成功后的回调函数
 * @param callbackObject.error: 创建或者连接的数据库失败后的回调函数
 * @param callbackObject.upgradeneeded: 数据库版本号更新后的回调函数
 */
export function initDatabase(name: string, version: number, callbackObject: CallbackObject): InitIDB {
  return new InitIDB({
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
  return InitIDB.idbFactory().deleteDatabase(databaseName);
}

/* 导出类型 */
export * from './InitIDB';
export * from './objectStore/ObjectStore';