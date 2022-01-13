import { IndexedDBRedux } from './IDBRedux';

/**
 * @param { string } name: 创建或者连接的数据库名
 * @param { number } version: 数据库版本号
 */
export function IDBRedux(name: string, version: number): IndexedDBRedux {
  return new IndexedDBRedux(name, version);
}

/* 导出类型 */
export * from './IDBRedux';