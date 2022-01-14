/**
 * 大于
 * @param { string } range
 */
export function isUpper(range: string): boolean {
  return /^\s*>\s*(-?\d+(\.\d+)?)\s*$/i.test(range);
}

/**
 * 大于等于
 * @param { string } range
 */
export function isUpperAndEqual(range: string): boolean {
  return /^\s*>\s*=\s*(-?\d+(\.\d+)?)\s*$/i.test(range);
}

/**
 * 小于
 * @param { string } range
 */
export function isLower(range: string): boolean {
  return /^\s*<\s*(-?\d+(\.\d+)?)\s*$/i.test(range);
}

/**
 * 小于等于
 * @param { string } range
 */
export function isLowerAndEqual(range: string): boolean {
  return /^\s*<\s*=\s*(-?\d+(\.\d+)?)\s*$/i.test(range);
}

/**
 * 区间
 * @param { string } range
 */
export function isInterval(range: string): boolean {
  return /^\s*[\[(]\s*(-?\d+(\.\d+)?)\s*,\s*(-?\d+(\.\d+)?)\s*[\])]\s*$/i.test(range);
}

/**
 * 左开区间
 * @param { string } range
 */
export function isLeftOpenInterval(range: string): boolean {
  return /^.*\(.*$/i.test(range);
}

/**
 * 右开区间
 * @param { string } range
 */
export function isRightOpenInterval(range: string): boolean {
  return /^.*\).*$/i.test(range);
}