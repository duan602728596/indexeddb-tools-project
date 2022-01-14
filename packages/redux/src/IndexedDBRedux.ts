import {
  initDatabase,
  type IDBEvent,
  type ObjectStore,
  type GetEvent,
  type CursorEvent,
  type CursorArgs
} from '@indexeddb-tools/indexeddb';
import type { Dispatch } from 'redux';

export interface QueryArgs {
  query: string | number;
}

export interface DateArgs {
  data: any | Array<any>;
}

export interface CursorQuery {
  indexName: string;
  range?: IDBValidKey;
}

export interface CursorQueryArgs {
  query: CursorQuery;
}

export interface CursorByIDBKeyRangQuery {
  indexName: string;
  range: IDBKeyRange;
}

// 返回的数据类型
export interface ActionResult {
  query?: string | number | CursorQuery | CursorByIDBKeyRangQuery;
  data?: any | Array<any>;
  result?: Array<any>;
  error?: Error;
}

// action的参数类型
export interface ActionArgs {
  objectStoreName: string;
  successAction?(ActionResult);
  failAction?(ActionResult);
}

// 创建action的返回类型
export interface DataDispatchFunc {
  (args: DateArgs);
}

export interface QueryDispatchFunc {
  (args: QueryArgs);
}

export interface CursorDispatchFunc {
  (args: CursorQueryArgs);
}

export class IndexedDBRedux {
  public name: string;
  public version: number;

  /**
   * 初始化数据库信息，需要传入数据库名称和版本号
   * @param { string } name
   * @param { number } version
   */
  constructor(name: string, version: number) {
    this.name = name;
    this.version = version;
  }

  /**
   * 添加数据
   * @param { string } objectStoreName: objectStore的名字
   * @param successAction: 获取数据成功的Action
   * @param failAction: 获取数据失败的Action
   */
  addAction({ objectStoreName, successAction, failAction }: ActionArgs): DataDispatchFunc {
    return (args: DateArgs): Function => {
      const { data }: DateArgs = args;

      return (dispatch: Dispatch): Promise<ActionResult | void> => {
        return new Promise<ActionResult>((resolve: Function, reject: Function): void => {
          initDatabase(this.name, this.version, {
            success(idbEvent: IDBEvent): void {
              const store: ObjectStore | undefined = this.getObjectStore(objectStoreName, true);
              const result: ActionResult = { data };

              store && store.add(data);
              successAction && dispatch(successAction(result));
              resolve(result);
              this.close();
            }
          });
        }).catch((err: Error): void => {
          failAction && dispatch(failAction({ data, error: err }));
        });
      };
    };
  }

  /**
   * 更新数据
   * @param { string } objectStoreName: objectStore的名字
   * @param successAction: 获取数据成功的Action
   * @param failAction: 获取数据失败的Action
   */
  putAction({ objectStoreName, successAction, failAction }: ActionArgs): DataDispatchFunc {
    return (args: DateArgs): Function => {
      const { data }: DateArgs = args;

      return (dispatch: Dispatch): Promise<ActionResult | void> => {
        return new Promise<ActionResult>((resolve: Function, reject: Function): void => {
          initDatabase(this.name, this.version, {
            success(idbEvent: IDBEvent): void {
              const store: ObjectStore | undefined = this.getObjectStore(objectStoreName, true);
              const result: ActionResult = { data };

              store && store.put(data);
              successAction && dispatch(successAction(result));
              resolve(result);
              this.close();
            }
          });
        }).catch((err: Error): void => {
          failAction && dispatch(failAction({ data, error: err }));
        });
      };
    };
  }

  /**
   * 删除数据
   * @param { string } objectStoreName: objectStore的名字
   * @param successAction: 获取数据成功的Action
   * @param failAction: 获取数据失败的Action
   */
  deleteAction({ objectStoreName, successAction, failAction }: ActionArgs): QueryDispatchFunc {
    return (args: QueryArgs): Function => {
      const { query }: QueryArgs = args;

      return (dispatch: Dispatch): Promise<ActionResult | void> => {
        return new Promise<ActionResult>((resolve: Function, reject: Function): void => {
          initDatabase(this.name, this.version, {
            success(idbEvent: IDBEvent): void {
              const store: ObjectStore | undefined = this.getObjectStore(objectStoreName, true);
              const result: ActionResult = { query };

              store && store.delete(query);
              successAction && dispatch(successAction(result));
              resolve(result);
              this.close();
            }
          });
        }).catch((err: Error): void => {
          failAction && dispatch(failAction({ query, error: err }));
        });
      };
    };
  }

  /**
   * 清除数据
   * @param { string } objectStoreName: objectStore的名字
   * @param successAction: 获取数据成功的Action
   * @param failAction: 获取数据失败的Action
   */
  clearAction({ objectStoreName, successAction, failAction }: ActionArgs): Function {
    return (): Function => {
      return (dispatch: Dispatch): Promise<void> => {
        return new Promise<void>((resolve: Function, reject: Function): void => {
          initDatabase(this.name, this.version, {
            success(idbEvent: IDBEvent): void {
              const store: ObjectStore | undefined = this.getObjectStore(objectStoreName, true);

              store && store.clear();
              successAction && dispatch(successAction({}));
              resolve({});
              this.close();
            }
          });
        }).catch((err: ErrorEvent): void => {
          failAction && dispatch(failAction({ err: Error }));
        });
      };
    };
  }

  /**
   * 获取数据
   * @param { string } objectStoreName: objectStore的名字
   * @param successAction: 获取数据成功的Action
   * @param failAction: 获取数据失败的Action
   */
  getAction({ objectStoreName, successAction, failAction }: ActionArgs): QueryDispatchFunc {
    return (args: QueryArgs): Function => {
      const { query }: QueryArgs = args;

      return (dispatch: Dispatch): Promise<ActionResult | void> => {
        return new Promise<ActionResult>((resolve: Function, reject: Function): void => {
          initDatabase(this.name, this.version, {
            success(IDBEvent: IDBEvent): void {
              const store: ObjectStore | undefined = this.getObjectStore(objectStoreName);

              const callback: Function = (actionResult: ActionResult): void => {
                successAction && dispatch(successAction(actionResult));
                resolve(actionResult);
                this.close();
              };

              if (store) {
                store.get(query, function(event: GetEvent): void {
                  callback({ query, result: event.target.result });
                });
              } else {
                callback({ query, result: [] });
              }
            }
          });
        }).catch((err: Error): void => {
          failAction && dispatch(failAction({ query, error: err }));
        });
      };
    };
  }

  /**
   * 根据游标查询数据
   * @param { string } objectStoreName: objectStore的名字
   * @param successAction: 获取数据成功的Action
   * @param failAction: 获取数据失败的Action
   */
  cursorAction({ objectStoreName, successAction, failAction }: ActionArgs): CursorDispatchFunc {
    return (args: CursorQueryArgs): Function => {
      const { indexName, range }: CursorQuery = args.query;

      return (dispatch: Dispatch): Promise<ActionResult | void> => {
        return new Promise<ActionResult>((resolve: Function, reject: Function): void => {
          initDatabase(this.name, this.version, {
            success(idbEvent: IDBEvent): void {
              const store: ObjectStore | undefined = this.getObjectStore(objectStoreName);

              const callback: Function = (actionResult: ActionResult): void => {
                successAction && dispatch(successAction(actionResult));
                resolve(actionResult);
                this.close();
              };

              if (store) {
                const IDBResult: Array<any> = [];

                const cursorCallback: Function = (event: CursorEvent): void => {
                  if (event.target.result) {
                    IDBResult.push(event.target.result.value);
                    event.target.result.continue();
                  } else {
                    callback({ query: args.query, result: IDBResult });
                  }
                };

                const cursorArgs: CursorArgs = range ? [range, cursorCallback] : [cursorCallback];

                store.cursor(indexName, ...cursorArgs);
              } else {
                callback({ query: args.query, result: [] });
              }
            }
          });
        }).catch((err: Error): void => {
          failAction && dispatch(failAction({ query: args.query, error: err }));
        });
      };
    };
  }
}