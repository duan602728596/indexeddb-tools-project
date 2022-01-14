/**
 * 获取IDBKeyRange
 * 根据字符串返回游标查询的范围，例如：
 * '5'      等于rollup
 * '>  5'   大于
 * '>= 5'   大于等于
 * '<  5'   小于
 * '<= 5'   小于等于
 * '[5, 8]' 闭区间
 * '(5, 8)' 开区间
 * @param { IDBValidKey } range: 传递字符串
 */
function createIDBKeyRange(range: IDBValidKey): IDBValidKey | IDBKeyRange {
  // 判断是否为数组，用于多条件查询
  if (Array.isArray(range)) {
    return IDBKeyRange.only(range);
  }

  // 如果是数字类型或者是IDBKeyRange，不作处理
  if (typeof range !== 'string') {
    return range;
  }

  // 大于
  if (/^\s*>\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
    const regMatchArr: RegExpMatchArray | null = range.match(/(-?\d+(\.\d+)?)/g);

    if (regMatchArr) {
      return IDBKeyRange.lowerBound(Number(regMatchArr[0]), true);
    }
  }

  // 大于等于
  if (/^\s*>\s*=\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
    const regMatchArr: RegExpMatchArray | null = range.match(/(-?\d+(\.\d+)?)/g);

    if (regMatchArr) {
      return IDBKeyRange.lowerBound(Number(regMatchArr[0]));
    }
  }

  // 小于
  if (/^\s*<\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
    const regMatchArr: RegExpMatchArray | null = range.match(/(-?\d+(\.\d+)?)/g);

    if (regMatchArr) {
      return IDBKeyRange.upperBound(Number(regMatchArr[0]), true);
    }
  }

  // 小于等于
  if (/^\s*<\s*=\s*(-?\d+(\.\d+)?)\s*$/i.test(range)) {
    const regMatchArr: RegExpMatchArray | null = range.match(/(-?\d+(\.\d+)?)/g);

    if (regMatchArr) {
      return IDBKeyRange.upperBound(Number(regMatchArr[0]));
    }
  }

  // 判断区间
  if (/^\s*[\[\(]\s*(-?\d+(\.\d+)?)\s*\,\s*(-?\d+(\.\d+)?)\s*[\]\)]\s*$/i.test(range)) {
    const regMatchArr: RegExpMatchArray | null = range.match(/(-?\d+(\.\d+)?)/g);

    if (regMatchArr) {
      const [left, right]: RegExpMatchArray = regMatchArr;
      let [isOpenLeft, isOpenRight]: boolean[] = [false, false];

      // 判断左右开区间和闭区间
      if (/^.*\(.*$/.test(range)) {
        isOpenLeft = true;
      }

      if (/^.*\).*$/.test(range)) {
        isOpenRight = true;
      }

      return IDBKeyRange.bound(Number(left), Number(right), isOpenLeft, isOpenRight);
    }
  }

  return range;
}

export default createIDBKeyRange;