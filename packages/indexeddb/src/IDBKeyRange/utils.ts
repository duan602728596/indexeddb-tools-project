/**
 * 提取字符串中的数字
 * @param { string } range
 */
export function matchNumber(range: string): RegExpMatchArray | null {
  return range.match(/(-?\d+(\.\d+)?)/g);
}

/**
 * 将range提取出数字
 * @param { string } range
 */
export function getRangeNumber(range: string): number | undefined {
  const rangeMatchResult: RegExpMatchArray | null = matchNumber(range);

  if (rangeMatchResult) {
    return Number(rangeMatchResult[0]);
  }
}

/**
 * 判断是否全都有值
 * @param { unknown[] } value
 */
export function isAllNotNil(...value: unknown[]): boolean {
  return !value.some((o: unknown): boolean => typeof value === 'undefined' || value === null);
}