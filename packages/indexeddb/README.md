# indexeddb

操作本地数据库的核心方法。

## 使用方法

### 初始化

```javascript
import { initDatabase } from '@indexeddb-tools/indexeddb';

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
```

### 删除数据库

```javascript
import { deleteDatabase } from '@indexeddb-tools/indexeddb';

deleteDatabase(dbName);
```

### 关闭数据库

```javascript
initDatabase(dbName, dbVersion, {
  success(event) {
    this.close();
  }
});
```

### 创建一个objectStore来存储数据

```javascript
import { initDatabase } from '@indexeddb-tools/indexeddb';

initDatabase(name, version, {
  upgradeneeded(IDBEvent) {
    this.createObjectStore(objectStoreName, keyPath, [
      {
        name: name,
        index: index,
        // https://developer.mozilla.org/en-US/docs/Web/API/IDBObjectStore/createIndex
        options: { unique: false }
      }
    ]);
  }
});
```

### 判断是否有objectStore

```javascript
initDatabase(dbName, dbVersion, {
  success(IDBEvent) {
    this.hasObjectStore(objectStoreName);
  }
});
```

### 删除objectStore

```javascript
initDatabase(dbName, dbVersion, {
  success(IDBEvent) {
    this.deleteObjectStore(objectStoreName);
  }
});
```

### 获取objectStore

```javascript
initDatabase(dbName, dbVersion, {
  success(IDBEvent) {
    const store = this.getObjectStore(objectStoreName, true);
  }
});
```

### 添加数据

value的类型可以是Array或者Object。

```javascript
store.add(value);
```

### 更新数据

value的类型可以是Array或者Object。

```javascript
store.put(value);
```

### 查找数据

根据主键的值来查找数据。

```javascript
initDatabase(dbName, dbVersion, {
  success(IDBEvent) {
    const store = this.getObjectStore(objectStoreName, true);
    
    store.get(query, function(event) {
      const result = event.target.result;
    });
  }
});
```

### 删除数据

删除数据是根据主键的值来删除的。value可以是string、number或Array类型。

```javascript
store.delete(value);
```

### 清除objectStore内的数据

```javascript
store.clear(value);
```

### 通过游标查询

range用来选择范围。如果想要查询所有数据，可以不传range。   
value可以是string、number或Array类型。也可以传递一个IDBKeyRange对象。

```javascript
store.cursor(indexName, callback);

// 或

store.cursor(indexName, range, callback);
```

使用方法：

```javascript
initDatabase(dbName, dbVersion, {
  success(IDBEvent) {
    const store = this.getObjectStore(objectStoreName);

    store.cursor('index', function(event) {
      const result = event.target.value;
      const queryResult = [];

      if (result) {
        queryResult.push(result.value);
        result.continue();
      }
    });

    // 或

    store.cursor('index', 'name', function(event) {
      const result = event.target.value;
      const queryResult = [];

      if (result) {
        queryResult.push(result.value);
        result.continue();
      }
    });
  }
});
```

根据字符串返回游标查询的范围：

* `> 5`：大于
* `>= 5`：大于等于
* `< 5`：小于
* `<= 5`：小于等于
* `[5, 8]`或`>= 5 && <= 8`：闭区间（5 <= x <= 8）
* `(5, 8)`或`> 5 && < 8`：开区间（5 < x < 8）