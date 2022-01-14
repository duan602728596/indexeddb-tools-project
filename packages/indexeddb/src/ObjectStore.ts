import createIDBKeyRange from './IDBKeyRange/createIDBKeyRange';

export interface GetEventTarget extends EventTarget {
  result: Array<any>;
}

export interface GetEvent extends Event {
  target: GetEventTarget;
}

export interface CursorEventTarget extends EventTarget {
  result?: {
    value: Array<any>;
    continue: Function;
  };
}

export interface CursorEvent extends Event {
  target: CursorEventTarget;
}

type IDBData = Record<any, any>; // 数据库返回的类型

// 定义获取数据的回调函数
interface GetCallback {
  (this: ObjectStore, event: GetEvent);
}

interface CursorCallback {
  (this: ObjectStore, event: CursorEvent);
}

// 定义游标查询的参数
export type CursorArgsHasIDBValidKey = [IDBValidKey, Function];
export type CursorArgsOnlyCallback = [Function];
export type CursorArgs = CursorArgsHasIDBValidKey | CursorArgsOnlyCallback;

/* 获取数据的操作 */
export class ObjectStore {
  public idbDatabase: IDBDatabase;
  public idbStore: IDBObjectStore;

  constructor(objectStoreArgs: {
    objectStoreName: string;
    idbDatabase: IDBDatabase;
    writeAble: boolean;
  }) {
    this.idbDatabase = objectStoreArgs.idbDatabase;

    const idbMode: IDBTransactionMode = objectStoreArgs.writeAble ? 'readwrite' : 'readonly';
    const transaction: IDBTransaction = this.idbDatabase.transaction(objectStoreArgs.objectStoreName, idbMode);

    this.idbStore = transaction.objectStore(objectStoreArgs.objectStoreName);
  }

  /* 关闭数据库 */
  close(): void {
    this.idbDatabase.close();
  }

  /**
   * 添加数据
   * @param { IDBData | Array<IDBData> } arg: 数组添加多个数据，object添加单个数据
   * @return { this }
   */
  add(arg: IDBData | Array<IDBData>): this {
    const data: Array<IDBData> = Array.isArray(arg) ? arg : [arg];

    data.forEach((o: IDBData): unknown => this.idbStore.add(o));

    return this;
  }

  /**
   * 更新数据
   * @param { IDBData | Array<IDBData> } arg: 数组添加多个数据，object添加单个数据
   * @return { this }
   */
  put(arg: IDBData | Array<IDBData>): this {
    const data: Array<IDBData> = Array.isArray(arg) ? arg : [arg];

    data.forEach((o: IDBData): unknown => this.idbStore.put(o));

    return this;
  }

  /**
   * 删除数据
   * @param { string | number | Array<string | number> } arg: 数组删除多个数据，string、number删除单个数据
   * @return this
   */
  delete(arg: string | number | Array<string | number>): this {
    const data: Array<string | number> = Array.isArray(arg) ? arg : [arg];

    data.forEach((o: string | number): unknown => this.idbStore.delete(o));

    return this;
  }

  /* 清除数据 */
  clear(): this {
    this.idbStore.clear();

    return this;
  }

  /**
   * 获取数据
   * @param { string | number} value: 键值
   * @param { GetCallback } callback   : 获取成功的回调函数
   * @return { this }
   */
  get(value: string | number, callback: GetCallback): this {
    const idbRequest: IDBRequest<object | undefined> = this.idbStore.get(value);

    idbRequest.addEventListener('success', (event: GetEvent): void => {
      callback && callback.call(this, event);
    });

    return this;
  }

  /**
   * 简单的游标查询
   * @param { string } indexName: 索引名
   * @param { Array<any> } args
   * @return { this }
   */
  cursor(indexName: string, ...args: CursorArgs): this {
    // 查询成功的回调函数
    let callback: Function;
    let range: IDBValidKey | undefined;

    if (args.length === 1) {
      const cursorArgs: CursorArgsOnlyCallback = args;

      // eslint-disable-next-line @typescript-eslint/typedef
      [range, callback] = [undefined, cursorArgs[0]];
    } else {
      // eslint-disable-next-line @typescript-eslint/typedef
      [range, callback] = args;
    }

    // 查询范围：有等于，大于等于，小于，小于等于，区间
    const IDBKeyRange: IDBValidKey | IDBKeyRange | undefined = range ? createIDBKeyRange(range) : undefined;
    const index: IDBIndex = this.idbStore.index(indexName);
    const cursor: IDBRequest<IDBCursorWithValue | null> = IDBKeyRange ? index.openCursor(IDBKeyRange) : index.openCursor();

    cursor.addEventListener('success', (event: CursorEvent): void => {
      callback && callback.call(this, event);
    });

    return this;
  }
}