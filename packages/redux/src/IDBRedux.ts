import { initDatabase, type IDBEvent, type ObjectStore, type GetEvent } from '@indexeddb-tools/indexeddb';
import type { Dispatch } from 'redux';

export interface Query {
  query: string | number;
}

export interface ActionResult {
  query?: string | number;
  result?: Array<any>;
  error?: Error;
}

export interface ActionArgs {
  objectStoreName: string;
  successAction(ActionResult);
  failAction?(ActionResult);
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
   * 获取数据
   * @param { string } objectStoreName: objectStore的名字
   * @param { (ActionResult) => any } successAction: 获取数据成功的Action
   * @param { (ActionResult) => any } failAction: 获取数据失败的Action
   */
  getAction({ objectStoreName, successAction, failAction }: ActionArgs): Function {
    return (args: Query): Function => {
      const { query }: Query = args;

      return (dispatch: Dispatch): Promise<any> => {
        return new Promise((resolve: Function, reject: Function): void => {
          initDatabase(this.name, this.version, {
            success(IDBEvent: IDBEvent): void {
              const store: ObjectStore | undefined = this.getObjectStore(objectStoreName);
              const callback: Function = (result: ActionResult): void => {
                successAction && dispatch(successAction(result));
                resolve(result);
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
}