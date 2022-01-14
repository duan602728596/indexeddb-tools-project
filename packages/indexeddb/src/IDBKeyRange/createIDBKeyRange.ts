import {
  isUpper,
  isUpperAndEqual,
  isLower,
  isLowerAndEqual,
  isInterval,
  isLeftOpenInterval,
  isRightOpenInterval
} from './rangeParser';
import { matchNumber, getRangeNumber } from './utils';

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
  if (isUpper(range)) {
    const rangeResult: number | undefined = getRangeNumber(range);

    if (rangeResult) {
      return IDBKeyRange.lowerBound(rangeResult, true);
    }
  }

  // 大于等于
  if (isUpperAndEqual(range)) {
    const rangeResult: number | undefined = getRangeNumber(range);

    if (rangeResult) {
      return IDBKeyRange.lowerBound(rangeResult);
    }
  }

  // 小于
  if (isLower(range)) {
    const rangeResult: number | undefined = getRangeNumber(range);

    if (rangeResult) {
      return IDBKeyRange.upperBound(rangeResult, true);
    }
  }

  // 小于等于
  if (isLowerAndEqual(range)) {
    const rangeResult: number | undefined = getRangeNumber(range);

    if (rangeResult) {
      return IDBKeyRange.upperBound(rangeResult);
    }
  }

  // 判断区间
  if (isInterval(range)) {
    const rangeMatchResult: RegExpMatchArray | null = matchNumber(range);

    if (rangeMatchResult) {
      const [leftNumber, rightNumber]: RegExpMatchArray = rangeMatchResult;
      const [leftOpenInterval, rightOpenInterval]: [boolean, boolean] = [
        isLeftOpenInterval(range),
        isRightOpenInterval(range)
      ];

      return IDBKeyRange.bound(Number(leftNumber), Number(rightNumber), leftOpenInterval, rightOpenInterval);
    }
  }

  return range;
}

export default createIDBKeyRange;