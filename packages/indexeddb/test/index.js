import mocha from 'mocha/mocha';
import 'mocha/mocha.css';
import { expect } from 'chai';
import { deleteDatabase } from '../src/index';
import {
  dbName,
  IDBInit,
  objectStoreInit,
  getIDBDataById,
  IDBPutData,
  IDBCursorData,
  IDBCursorByIDBKeyRangData,
  IDBDeleteData,
  IDBClearData
} from './utils';
import mockDataJson from './mock.json';

const { mockData } = mockDataJson;

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

describe('数据库测试', function() {
  describe('初始化数据库', function() {
    it('初始化数据库', async function() {
      const result = await IDBInit();

      expect(result).to.be.true;
    });
  });

  describe('数据存储', function() {
    it('测试数据的存储和获取', async function() {
      const saveResult = await objectStoreInit('table_0', mockData[0].data);

      expect(saveResult).to.be.true;

      const id1Result = await getIDBDataById('table_0', 1);
      const id2Result = await getIDBDataById('table_0', 2);
      const id3Result = await getIDBDataById('table_0', 3);

      expect(id1Result).to.eql(mockData[0].data[0]);
      expect(id2Result).to.eql(mockData[0].data[1]);
      expect(id3Result).to.eql(mockData[0].data[2]);
    });

    it('测试数据的更新和获取', async function() {
      const saveResult = await objectStoreInit('table_1', mockData[0].data);
      const putDataResult = await IDBPutData('table_1', mockData[1].data);
      const cursorQueryResult = await IDBCursorData('table_1', 'username');

      cursorQueryResult.sort(sortCallback);

      expect(saveResult).to.be.true;
      expect(putDataResult).to.be.true;
      expect(cursorQueryResult).to.eql(mockData[1].data);
    });

    it('测试数据的查找', async function() {
      const saveResult = await objectStoreInit('table_2', mockData[2].data);

      expect(saveResult).to.be.true;

      // 查询money大于等于100且小于3250
      {
        const queryMoneyResult = await IDBCursorData('table_2', 'money', '[100, 3250)');

        queryMoneyResult.sort(sortCallback);
        expect(queryMoneyResult).to.eql(mockData[2].data.filter((o) => o.money >= 100 && o.money < 3250));
      }

      // 查询money大于400且小于等于7300
      {
        const queryMoneyResult = await IDBCursorData('table_2', 'money', '(400, 7300]');

        queryMoneyResult.sort(sortCallback);
        expect(queryMoneyResult).to.eql(mockData[2].data.filter((o) => o.money > 400 && o.money <= 7300));
      }

      // 查询藤原千花
      {
        const queryFujiwaraChikaResult = await IDBCursorData('table_2', 'username', '藤原千花');

        expect(queryFujiwaraChikaResult).to.eql(mockData[2].data.filter((o) => o.username === '藤原千花'));
      }

      // 查询大于3250
      {
        const moreThanThe3250Result = await IDBCursorData('table_2', 'money', '>3250');

        moreThanThe3250Result.sort(sortCallback);
        expect(moreThanThe3250Result).to.eql(mockData[2].data.filter((o) => o.money > 3250));
      }

      // 查询小于等于5200
      {
        const lessThanOrEqualTo5200Result = await IDBCursorData('table_2', 'money', '<=5200');

        lessThanOrEqualTo5200Result.sort(sortCallback);
        expect(lessThanOrEqualTo5200Result).to.eql(mockData[2].data.filter((o) => o.money <= 5200));
      }
    });

    it('多条件查找', async function() {
      const saveResult = await objectStoreInit('table_3', mockData[2].data);

      expect(saveResult).to.be.true;

      {
        const result = await IDBCursorByIDBKeyRangData(
          'table_3', 'sex_money', IDBKeyRange.only(['女', 5200]));

        expect(result).to.eql(mockData[2].data.filter((o) => o.sex === '女' && o.money === 5200));
      }

      {
        const result = await IDBCursorData('table_3', 'sex_money', ['男', 3250]);

        expect(result).to.eql(mockData[2].data.filter((o) => o.sex === '男' && o.money === 3250));
      }
    });

    it('测试数据的删除和清除', async function() {
      const saveResult = await objectStoreInit('table_4', mockData[2].data);

      expect(saveResult).to.be.true;

      // 删除数据
      const deleteResult = await IDBDeleteData('table_4', [2, 3]);

      expect(deleteResult).to.be.true;

      // 查找删除后的数据
      const queryResult = await IDBCursorData('table_4', 'username');

      queryResult.sort(sortCallback);
      expect(queryResult).to.eql(mockData[2].data.filter((o) => o.id !== 2 && o.id !== 3));

      // 清空表
      const clearResult = await IDBClearData('table_4');

      expect(clearResult).to.be.true;

      // 查找删除后的数据
      const queryClearTableResult = await IDBCursorData('table_4', 'username');

      expect(queryClearTableResult).to.eql([]);
    });
  });

  after(function() {
    deleteDatabase(dbName);
  });
});

mocha.run();