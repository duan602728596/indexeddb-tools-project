import {
  isUpper,
  isUpperAndEqual,
  isLower,
  isLowerAndEqual,
  isInterval,
  isLeftOpenInterval,
  isRightOpenInterval,
  isIntervalByAndSymbol
} from './rangeParser';
import { matchNumber, getRangeNumber, isAllNotNil } from './utils';

interface RangeIntervalResult {
  position: 'left' | 'right';
  open: boolean;
  value: number;
}

/**
 * 判断区间和数字
 * @param { string | undefined } intervalRange
 */
function rangeInterval(intervalRange: string | undefined): RangeIntervalResult | undefined {
  if (!intervalRange) return;

  // 解析数字
  const rangeResult: number | undefined = getRangeNumber(intervalRange);

  if (typeof rangeResult !== 'number') return;

  // 大于
  if (isUpper(intervalRange)) {
    return {
      position: 'left',
      open: true,
      value: rangeResult
    };
  }

  // 大于等于
  if (isUpperAndEqual(intervalRange)) {
    return {
      position: 'left',
      open: false,
      value: rangeResult
    };
  }

  // 小于
  if (isLower(intervalRange)) {
    return {
      position: 'right',
      open: true,
      value: rangeResult
    };
  }

  // 小于等于
  if (isLowerAndEqual(intervalRange)) {
    return {
      position: 'right',
      open: false,
      value: rangeResult
    };
  }
}

/**
 * 获取IDBKeyRange
 * 根据字符串返回游标查询的范围，例如：
 * '5'         等于
 * '>  5'      大于
 * '>= 5'      大于等于
 * '<  5'      小于
 * '<= 5'      小于等于
 * '[5, 8]'    闭区间
 * '(5, 8)'    开区间
 * >= 5 && < 8 区间的另一种形式
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

  // 使用&&符号来实现区间
  if (isIntervalByAndSymbol(range)) {
    const interval: string[] = range.split(/&&/);
    const rangeIntervalResults: (RangeIntervalResult | undefined)[] = [
      rangeInterval(interval[0]),
      rangeInterval(interval[1])
    ];
    let [lower, upper, lowerOpen, upperOpen]: [
      number | undefined,
      number | undefined,
      boolean | undefined,
      boolean | undefined
    ] = [undefined, undefined, undefined, undefined];

    for (const rangeIntervalResult of rangeIntervalResults) {
      if (rangeIntervalResult) {
        if (rangeIntervalResult.position === 'left') {
          lower = rangeIntervalResult.value;
          lowerOpen = rangeIntervalResult.open;
        } else if (rangeIntervalResult.position === 'right') {
          upper = rangeIntervalResult.value;
          upperOpen = rangeIntervalResult.open;
        }
      }
    }

    if (isAllNotNil(lower, upper, lowerOpen, upperOpen)) {
      return IDBKeyRange.bound(lower, upper, lowerOpen, upperOpen);
    }
  }

  return range;
}

export default createIDBKeyRange;