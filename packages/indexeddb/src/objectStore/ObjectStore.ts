import createIDBKeyRange from './createIDBKeyRange';

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

type IDBData = Record<any, any>;

interface GetCallback {
  (this: ObjectStore, event: GetEvent);
}

interface CursorCallback {
  (this: ObjectStore, event: CursorEvent);
}

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
  cursor(indexName: string, ...args: unknown[]): this {
    // 查询成功的回调函数
    const callback: Function = (typeof args[0] === 'function' ? args[0] : args[1]) as Function;

    // 查询范围：有等于，大于等于，小于，小于等于，区间
    const range: IDBValidKey | IDBKeyRange | undefined = args[1] ? createIDBKeyRange(args[0] as IDBValidKey) : undefined;
    const index: IDBIndex = this.idbStore.index(indexName);
    const cursor: IDBRequest<IDBCursorWithValue | null> = range ? index.openCursor(range) : index.openCursor();

    cursor.addEventListener('success', (event: CursorEvent): void => {
      callback && callback.call(this, event);
    });

    return this;
  }

  /**
   * 根据IDBKeyRang查询
   * @param { string } indexName: 索引名
   * @param { IDBKeyRange } range: 原生的IDBKeyRange
   * @param { CursorCallback } callback: 回调函数
   */
  cursorByIDBKeyRang(indexName: string, range: IDBKeyRange, callback: CursorCallback): this {
    const index: IDBIndex = this.idbStore.index(indexName);
    const cursor: IDBRequest<IDBCursorWithValue | null> = index.openCursor(range);

    cursor.addEventListener('success', (event: CursorEvent): void => {
      callback && callback.call(this, event);
    });

    return this;
  }
}