# @indexeddb-tools/indexeddb-redux

indexeddb对redux的封装。

## 使用方法

### 初始化

```javascript
import { IDBReduxInstance } from '@indexeddb-tools/indexeddb-redux';

/**
 * name            连接的数据库名
 * version         数据库版本号
 * callbackObject  数据库创建或连接成功后的回调函数
 */
initDatabase(dbName, dbVersion, {
  success(IDBEvent) {},      // 数据库连接成功的回调函数
  error(IDBEvent) {},        // 数据库连接失败的回调函数
  upgradeneeded(IDBEvent) {} // 数据库首次创建成功的回调函数
});

const IDBRedux = IDBReduxInstance(dbName, dbVersion);
```

### 创建action

* IDBRedux.getAction：查询数据
* IDBRedux.addAction：添加数据
* IDBRedux.putAction：更新数据
* IDBRedux.deleteAction：删除数据
* IDBRedux.clearAction：清除数据
* IDBRedux.cursorAction：根据索引查询

```javascript
export const IDBGet = IDBRedux.getAction({
  objectStoreName: 'objectStoreName', // objectStore名字
  successAction,                      // 获取成功的Action
  failAction                          // 获取失败的Action
});
```

### 调用

```javascript
// 添加或者更新数据
const IDBAdd = IDBRedux.addAction({ objectStoreName: 'objectStoreName' });

const IDBPut = IDBRedux.putAction({ objectStoreName: 'objectStoreName' });

dispatch(IDBAdd({
  data: []
}));

dispatch(IDBAdd({
  data: []
}));

// 查询、删除数据
const IDBGet = IDBRedux.getAction({ objectStoreName: 'objectStoreName' });

const IDBDelete = IDBRedux.deleteAction({ objectStoreName: 'objectStoreName' });

dispatch(IDBGet({
  query: 'queryValue'
}));

dispatch(IDBDelete({
  query: 'queryValue'
}));

// 根据索引查询
const IDBCursor = IDBRedux.cursorAction({ objectStoreName: 'objectStoreName' });

dispatch(IDBCursor({
  query: {
    indexName: 'age',
    range: '>= 12'
  }
}));

// 清除数据
const IDBClear = IDBRedux.clearAction({ objectStoreName: 'objectStoreName' });

dispatch(IDBClear());
```

在reducer函数内可以获取：

```javascript
function reducer(state = {}, action) {
  const result = action.payload;

  switch(action.type){
    case 'TYPE_1':
      return { ...state, data_1: action.result };
      
    case 'TYPE_2':
      return { ...state, data_2: action.result };
      
    default:
      return state;
  }
}

```