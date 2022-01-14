import { ObjectStore } from './ObjectStore';

declare const webkitIndexedDB: IDBFactory;
declare const mozIndexedDB: IDBFactory;
declare const msIndexedDB: IDBFactory;

export interface IDBEventTarget extends EventTarget {
  result: IDBDatabase;
}

export interface IDBEvent extends Event {
  target: IDBEventTarget;
}

export interface IDBErrorEventTarget extends EventTarget {
  error: Error;
}

export interface IDBErrorEvent extends Event {
  target: IDBErrorEventTarget;
}

export interface CallbackObject {
  success(this: InitIDB, e: IDBEvent);
  error?(this: InitIDB, e: IDBErrorEvent);
  upgradeneeded?(this: InitIDB, e: IDBEvent & IDBVersionChangeEvent);
}

export interface IndexItem {
  name: string; // 索引
  index: string | Array<string>; // 键值
  options?: IDBIndexParameters;
}

/* 初始化数据库 */
export class InitIDB {
  // 浏览器兼容
  static idbFactory(): IDBFactory {
    return indexedDB || webkitIndexedDB || mozIndexedDB || msIndexedDB;
  }

  public name: string;
  public version: number;
  public callbackObject: CallbackObject;
  public request: IDBOpenDBRequest;
  public idbDatabase: IDBDatabase | null = null;

  constructor(initArgs: {
    name: string;
    version: number;
    callbackObject: CallbackObject;
  }) {
    this.name = initArgs.name;
    this.version = initArgs.version;
    this.callbackObject = initArgs.callbackObject ?? {};

    // 创建或者打开数据库
    this.request = InitIDB.idbFactory().open(this.name, this.version);

    // 绑定函数
    this.request.addEventListener('success', this.handleOpenIDBSuccess.bind(this), false);
    this.request.addEventListener('error', this.handleOpenIDBError.bind(this), false);
    this.request.addEventListener('upgradeneeded', this.handleIDBUpgradeneeded.bind(this), false);
  }

  // 打开数据库成功
  handleOpenIDBSuccess(IDBEvent: IDBEvent): void {
    this.idbDatabase = IDBEvent.target.result;

    if (this.callbackObject.success) {
      this.callbackObject.success.call(this, IDBEvent);
    }
  }

  // 打开数据库失败
  handleOpenIDBError(IDBEvent: IDBErrorEvent): void {
    console.error(IDBEvent.target.error.message);

    if (this.callbackObject.error) {
      this.callbackObject.error.call(this, IDBEvent);
    }
  }

  // 更新数据库版本
  handleIDBUpgradeneeded(IDBEvent: IDBEvent & IDBVersionChangeEvent): void {
    this.idbDatabase = IDBEvent.target.result;

    if (this.callbackObject.upgradeneeded) {
      this.callbackObject.upgradeneeded.call(this, IDBEvent);
    }
  }

  // 关闭数据库
  close(): void {
    this.idbDatabase && this.idbDatabase.close();
  }

  /**
   * 判断是否有objectStore
   * @param { string } objectStoreName: objectStore的名字
   * @return { boolean }
   */
  hasObjectStore(objectStoreName: string): boolean {
    if (this.idbDatabase) {
      return this.idbDatabase.objectStoreNames.contains(objectStoreName);
    }

    return false;
  }

  /**
   * 创建objectStore
   * @param { string } objectStoreName: objectStore的名字
   * @param { string } keyPath        : objectStore的关键字
   * @param { Array<IndexItem> } indexArray: 添加索引和键值，name -> 索引， index -> 键值
   * @return { this }
   */
  createObjectStore(objectStoreName: string, keyPath: string, indexArray: Array<IndexItem>): this {
    if (this.idbDatabase) {
      if (!this.hasObjectStore(objectStoreName)) {
        const store: IDBObjectStore = this.idbDatabase.createObjectStore(objectStoreName, { keyPath });

        indexArray && indexArray.forEach((o: IndexItem): unknown => store.createIndex(o.name, o.index, o.options));
      }
    }

    return this;
  }

  /**
   * 删除objectStore
   * @param { string } objectStoreName: objectStore的名字
   * @return { this }
   */
  deleteObjectStore(objectStoreName: string): this {
    if (this.idbDatabase && this.hasObjectStore(objectStoreName)) {
      this.idbDatabase.deleteObjectStore(objectStoreName);
    }

    return this;
  }

  /**
   * 获取操作ObjectStore
   * @param { string } objectStoreName: ObjectStore名字
   * @param { boolean } writeAble     : 只读还是读写
   * @return { IDBObjectStore }
   */
  getObjectStore(objectStoreName: string, writeAble: boolean = false): ObjectStore | undefined {
    if (this.idbDatabase) {
      return new ObjectStore({
        objectStoreName,
        idbDatabase: this.idbDatabase,
        writeAble
      });
    }
  }
}