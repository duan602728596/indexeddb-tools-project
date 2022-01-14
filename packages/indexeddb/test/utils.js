import { initDatabase } from '../src/index';

export const dbName = 'Test';
export const version = 1;
const keyPath = 'id';
const objectStore = [
  { name: 'username', index: 'username' },
  { name: 'from', index: 'from' },
  { name: 'sex', index: 'sex' },
  { name: 'money', index: 'money' },
  { name: 'sex_money', index: ['sex', 'money'], options: { unique: false } }
];
const tableName = 'table_';

// 初始化数据库
export function IDBInit(tableLength) {
  return new Promise((resolve, reject) => {
    initDatabase(dbName, version, {
      success(IDBEvent) {
        resolve(true);
      },
      upgradeneeded(IDBEvent) {
        for (let i = 0; i < tableLength; i++) {
          this.createObjectStore(`${ tableName }${ i }`, keyPath, objectStore);
        }
      }
    });
  });
}

/**
 * 初始化数据库表，并添加数据
 * @param { string } name: 数据库表名
 * @param { Array<object> } data: 需要存储的数据
 */
export function objectStoreInit(name, data) {
  return new Promise((resolve, reject ) => {
    initDatabase(dbName, version, {
      success(IDBEvent) {
        const store = this.getObjectStore(name, true);

        store.add(data);
        resolve(true);
        this.close();
      }
    });
  });
}

/**
 * 获取数据
 * @param { string } name: 数据库表名
 * @param { number } id: 查询的id
 */
export function getIDBDataById(name, id) {
  return new Promise((resolve, reject) => {
    initDatabase(dbName, version, {
      success(IDBEvent) {
        const store = this.getObjectStore(name);

        store.get(id, function(e) {
          resolve(e.target.result);
          this.close();
        });
      }
    });
  });
}

/**
 * 更新数据
 * @param { string } name: 数据库表名
 * @param { Array<object> } data: 需要存储的数据
 */
export function IDBPutData(name, data) {
  return new Promise((resolve, reject) => {
    initDatabase(dbName, version, {
      success(IDBEvent) {
        const store = this.getObjectStore(name, true);

        store.put(data);
        resolve(true);
        this.close();
      }
    });
  });
}

/**
 * 利用游标查找数据
 * @param { string } name: 数据库表名
 * @param { string } indexName: 查询字段
 * @param { IDBValidKey | undefined } query: 查询条件
 */
export function IDBCursorData(name, indexName, query) {
  return new Promise((resolve, reject) => {
    initDatabase(dbName, version, {
      success(IDBEvent) {
        const data = [];
        const store = this.getObjectStore(name, true);
        const cursorArgs = [indexName, function(e) {
          const result = e.target.result;

          if (result) {
            data.push(result.value);
            result.continue();
          } else {
            resolve(data);
            this.close();
          }
        }];

        if (query !== undefined) {
          cursorArgs.splice(1, 0, query);
        }

        store.cursor(...cursorArgs);
      }
    });
  });
}

/**
 * 删除数据
 * @param { string } name: 数据库表名
 * @param { string | number | Array<string | number> } id
 */
export function IDBDeleteData(name, id) {
  return new Promise((resolve, reject) => {
    initDatabase(dbName, version, {
      success(IDBEvent) {
        const store = this.getObjectStore(name, true);

        store.delete(id);
        resolve(true);
        this.close();
      }
    });
  });
}

/**
 * 清除数据库
 * @param { string } name: 数据库表名
 */
export function IDBClearData(name) {
  return new Promise((resolve, reject) => {
    initDatabase(dbName, version, {
      success(IDBEvent) {
        const store = this.getObjectStore(name, true);

        store.clear();
        resolve(true);
        this.close();
      }
    });
  });
}