import createIDBKeyRange from './createIDBKeyRange';

interface ObjectStoreArgs {
  objectStoreName: string;
  idbDatabase: IDBDatabase;
  writeAble: boolean;
}

/* 获取数据的操作 */
class ObjectStore {
  public idbDatabase: IDBDatabase;
  public idbStore: IDBObjectStore;

  constructor(objectStoreArgs: ObjectStoreArgs) {
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
   * @param { object | Array<Object> } arg: 数组添加多个数据，object添加单个数据
   * @return { this }
   */
  add(arg: object | Array<object>): this {
    const data: Array<object> = Array.isArray(arg) ? arg : [arg];

    data.forEach((o: object): unknown => this.idbStore.add(o));

    return this;
  }

  /**
   * 更新数据
   * @param { object | Array<object> } arg: 数组添加多个数据，object添加单个数据
   * @return { this }
   */
  put(arg: object | Array<object>): this {
    const data: Array<object> = Array.isArray(arg) ? arg : [arg];

    data.forEach((o: object): unknown => this.idbStore.put(o));

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
   * @param { Function } callback   : 获取成功的回调函数
   * @return { this }
   */
  get(value: string | number, callback: Function): this {
    const idbRequest: IDBRequest<object | undefined> = this.idbStore.get(value);

    // 成功后的回调函数
    const handleSuccess: EventListenerOrEventListenerObject = (event: Event): void => {
      callback && callback.call(this, event);
    };

    idbRequest.addEventListener('success', handleSuccess, false);

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

    // 成功后的回调函数
    const handleSuccess: EventListenerOrEventListenerObject = (event: Event): void => {
      callback && callback.call(this, event); // event.target.result.value && event.target.result.continue()
    };

    cursor.addEventListener('success', handleSuccess, false);

    return this;
  }

  /**
   * 根据IDBKeyRang查询
   * @param { string } indexName: 索引名
   * @param { IDBKeyRange } range: 原生的IDBKeyRange
   * @param { Function } callback: 回调函数
   */
  cursorByIDBKeyRang(indexName: string, range: IDBKeyRange, callback: Function): this {
    const index: IDBIndex = this.idbStore.index(indexName);
    const cursor: IDBRequest<IDBCursorWithValue | null> = index.openCursor(range);

    // 成功后的回调函数
    const handleSuccess: EventListenerOrEventListenerObject = (event: Event): void => {
      callback && callback.call(this, event); // event.target.result.value && event.target.result.continue()
    };

    cursor.addEventListener('success', handleSuccess, false);

    return this;
  }
}

export default ObjectStore;