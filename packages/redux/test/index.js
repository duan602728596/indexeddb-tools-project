import mocha from 'mocha/mocha';
import 'mocha/mocha.css';
import { expect } from 'chai';
import { configureStore } from '@reduxjs/toolkit';
import { deleteDatabase } from '../../indexeddb/src/index';
import { IDBReduxInstance } from '../src/index';
import { dbName, version, IDBInit, objectStoreInit } from '../../indexeddb/test/utils';
import mockDataJson from '../../indexeddb/test/mock.json';
import testReducers, { setData } from './reducers';

mocha.timeout(180000);
mocha.setup('bdd');

function sortCallback(b, r) {
  if (b.id < r.id) {
    return -1;
  } else if (b.id > r.id) {
    return 1;
  } else {
    return 0;
  }
}

const { mockData } = mockDataJson;
let store, dispatch;
let IDBRedux;

describe('数据库redux封装测试', function() {
  describe('初始化数据库', function() {
    it('初始化数据库', async function() {
      const result = await IDBInit(6);

      IDBRedux = IDBReduxInstance(dbName, version);
      expect(result).to.be.true;
    });
  });

  describe('数据存储', function() {
    it('测试数据的存储和获取', async function() {
      const saveResult = await objectStoreInit('table_0', mockData[0].data);

      expect(saveResult).to.be.true;

      const IDBGet = IDBRedux.getAction({ objectStoreName: 'table_0' });
      const id1Result = await dispatch(IDBGet({ query: 1 }));
      const id2Result = await dispatch(IDBGet({ query: 2 }));
      const id3Result = await dispatch(IDBGet({ query: 3 }));

      expect(id1Result.result).to.eql(mockData[0].data[0]);
      expect(id2Result.result).to.eql(mockData[0].data[1]);
      expect(id3Result.result).to.eql(mockData[0].data[2]);
    });

    it('测试数据的更新和获取', async function() {
      const saveResult = await objectStoreInit('table_1', mockData[0].data);

      expect(saveResult).to.be.true;

      const IDBPut = IDBRedux.putAction({ objectStoreName: 'table_1' });
      const IDBCursor = IDBRedux.cursorAction({ objectStoreName: 'table_1' });

      await dispatch(IDBPut({ data: mockData[1].data }));

      const cursorQueryResult = await dispatch(IDBCursor({
        query: { indexName: 'username' }
      }));

      cursorQueryResult.result.sort(sortCallback);
      expect(cursorQueryResult.result).to.eql(mockData[1].data);
    });

    it('测试数据的查找', async function() {
      const saveResult = await objectStoreInit('table_2', mockData[2].data);

      expect(saveResult).to.be.true;

      const IDBCursor = IDBRedux.cursorAction({ objectStoreName: 'table_2' });

      // 查询money大于等于100且小于3250
      {
        const queryMoneyResult = await dispatch(IDBCursor({
          query: {
            indexName: 'money',
            range: '>= 100 && < 3250'
          }
        }));

        queryMoneyResult.result.sort(sortCallback);
        expect(queryMoneyResult.result).to.eql(mockData[2].data.filter((o) => o.money >= 100 && o.money < 3250));
      }

      // 查询藤原千花
      {
        const queryFujiwaraChikaResult = await dispatch(IDBCursor({
          query: {
            indexName: 'username',
            range: '藤原千花'
          }
        }));

        expect(queryFujiwaraChikaResult.result).to.eql(mockData[2].data.filter((o) => o.username === '藤原千花'));
      }
    });

    it('多条件查找', async function() {
      const saveResult = await objectStoreInit('table_3', mockData[2].data);

      expect(saveResult).to.be.true;

      const IDBCursor = IDBRedux.cursorAction({ objectStoreName: 'table_3' });

      {
        const sexMoneyResult = await dispatch(IDBCursor({
          query: {
            indexName: 'sex_money',
            range: IDBKeyRange.only(['女', 5200])
          }
        }));

        expect(sexMoneyResult.result).to.eql(mockData[2].data.filter((o) => o.sex === '女' && o.money === 5200));
      }

      {
        const sexMoneyResult = await dispatch(IDBCursor({
          query: {
            indexName: 'sex_money',
            range: IDBKeyRange.only(['男', 3250])
          }
        }));

        expect(sexMoneyResult.result).to.eql(mockData[2].data.filter((o) => o.sex === '男' && o.money === 3250));
      }
    });

    it('测试数据的删除和清除', async function() {
      const saveResult = await objectStoreInit('table_4', mockData[2].data);

      expect(saveResult).to.be.true;

      // 删除数据
      const IDBDelete = IDBRedux.deleteAction({ objectStoreName: 'table_4' });

      await dispatch(IDBDelete({ query: [2, 3] }));

      // 查找删除后的数据
      const IDBCursor = IDBRedux.cursorAction({ objectStoreName: 'table_4' });
      const queryResult = await dispatch(IDBCursor({
        query: { indexName: 'username' }
      }));

      queryResult.result.sort(sortCallback);
      expect(queryResult.result).to.eql(mockData[2].data.filter((o) => o.id !== 2 && o.id !== 3));

      // 清空表
      const IDBClear = IDBRedux.clearAction({ objectStoreName: 'table_4' });

      await dispatch(IDBClear());

      // 查找删除后的数据
      const queryClearTableResult = await dispatch(IDBCursor({
        query: { indexName: 'username' }
      }));

      expect(queryClearTableResult.result).to.eql([]);
    });

    it('测试数据存储在store中', async function() {
      const saveResult = await objectStoreInit('table_5', []);

      expect(saveResult).to.be.true;

      const IDBPut = IDBRedux.putAction({ objectStoreName: 'table_5' });
      const IDBCursor = IDBRedux.cursorAction({
        objectStoreName: 'table_5',
        successAction: setData
      });

      await dispatch(IDBPut({ data: mockData[0].data }));

      const cursorQueryResult = await dispatch(IDBCursor({
        query: { indexName: 'username' }
      }));
      const cursorQueryResultCopy = [...cursorQueryResult.result];

      cursorQueryResultCopy.sort(sortCallback);
      expect(cursorQueryResultCopy).to.eql(mockData[0].data);

      const stateTestData = [...store.getState().test.data];

      stateTestData.sort(sortCallback);
      expect(stateTestData).to.eql(mockData[0].data);
    });
  });

  before(function() {
    store = configureStore({
      reducer: Object.assign({}, testReducers)
    });
    dispatch = store.dispatch;
  });

  after(function() {
    deleteDatabase(dbName);
  });
});

mocha.run();