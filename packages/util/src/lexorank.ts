const { max, log, floor, ceil, pow, abs } = Math;

export interface LexorankOptions {
  /**
   * if lowercase alpha characters should be included in rank strings, defaults to true
   */
  lower?: boolean;

  /**
   * if uppercase alpha characters should be included in rank strings, defaults to false
   */
  upper?: boolean;

  /**
   * if numeric characters should be included in rank strings, defaults to true
   */
  numeric?: boolean;

  /**
   * the expected number of sortable elements in the database as an exponent of 10
   * defaults to 6 for 10^6 = 10000000
   */
  expected?: number;

  /**
   * the character set to use for encoding
   */
  charset?: string;
}

export class Lexorank {
  static readonly numbers = "0123456789";
  static readonly letters = "abcdefghijklmnopqrstuvwxyz";

  public charset: string;
  public base: number;
  public digits: number;

  get _first() {
    return 0;
  }

  get _last() {
    return this.charset.length - 1;
  }

  get _middle() {
    return this.charset[floor(this.charset.length / 2)];
  }

  get _indexOf() {
    const charset = this.charset;
    return charset.indexOf.bind(charset);
  }

  public constructor({
    lower = true,
    upper = false,
    numeric = true,
    expected = 6,
    charset,
  }: LexorankOptions = {}) {
    charset ??= `${numeric ? Lexorank.numbers : ""}${
      upper ? Lexorank.letters.toUpperCase() : ""
    }${lower ? Lexorank.letters : ""}`;
    this.charset = charset;
    this.base = this.charset.length;
    if (this.base < 10)
      throw new RangeError(
        "Lexorank charset has to contain at least 10 characters",
      );
    this.digits = ceil(log(pow(10, expected)) / log(this.base)) + 1;
  }

  public next(rank?: string) {
    const { charset, _first, digits } = this;
    // leave space before first
    if (!rank) return this._pad(charset[_first]);
    rank = rank.slice(0, digits);
    return this._pad(this._encode(this._bigint(rank) + 1n));
  }

  public between(a?: string, b?: string, pad = true): string {
    const { charset, _last, _first, _indexOf } = this;
    a ||= charset[_first];
    b ||= charset[_last];
    const len = max(a.length, b.length);
    let different = false;
    let result = "";
    for (let i = 0; i < len; ++i) {
      const digitA = a.length > i ? _indexOf(a[i]) : 0;
      const digitB = different ? _last : b.length > i ? _indexOf(b[i]) : 0;
      const difference = abs(digitB - digitA);
      if (digitA === digitB) result += charset[digitA];
      else if (difference === 1) {
        different = true;
        result += charset[digitA];
        if (len === i + 1) result += this._middle;
      } else {
        result += charset[floor(digitA + difference / 2)];
        break;
      }
    }
    return pad ? this._pad(result) : result;
  }

  public balance(
    a: string,
    b: string,
    count: number = 2,
    pad = true,
  ): string[] {
    const { charset, _first, _last } = this;
    const [index, initialDifference] = this._divergent(a, b);
    const prefix = a.slice(0, index).padEnd(index, charset[_first]);
    const digitCount =
      initialDifference > count ? 1 : 1 + ceil(count / charset.length);
    a = a.slice(index, index + digitCount).padEnd(digitCount, charset[_first]);
    b = b.slice(index, index + digitCount).padEnd(digitCount, charset[_last]);
    const intA = this._bigint(a);
    const intB = this._bigint(b);
    const result = Array(count) as string[];
    const difference = intB - intA;
    for (let i = 0; i < count; ++i) {
      const added = ((i + 0.5) / count) * Number(difference);
      result[i] = prefix + this._encode(intA + BigInt(floor(added)));
      if (pad) result[i] = this._pad(result[i]);
    }
    return result;
  }

  private _divergent(
    a?: string,
    b?: string,
  ): [index: number, distance: number] {
    const { charset, _first, _last, _indexOf } = this;
    a ||= charset[_first];
    b ||= charset[_last];
    const len = max(a.length, b.length);
    let different = false;
    for (let i = 0; i < len; ++i) {
      const digitA = a.length > i ? _indexOf(a[i]) : 0;
      const digitB = different ? _last : b.length > i ? _indexOf(b[i]) : 0;
      const distance = digitB - digitA;
      if (distance === 1) different = true;
      else if (distance) return [i, distance];
    }
    return [len, _last];
  }

  private _encode(n: bigint = 0n) {
    const { charset } = this;
    const base = BigInt(charset.length);
    let digit = "";
    do {
      digit = charset[Number(n % base)] + digit;
      n /= base;
    } while (n);
    return digit;
  }

  private _bigint(rank: string) {
    const { charset, _indexOf } = this;
    const base = BigInt(charset.length);
    let result = 0n;
    for (let i = 0; i < rank.length; ++i) {
      result += BigInt(_indexOf(rank[i])) * base ** BigInt(rank.length - i - 1);
    }
    return result;
  }

  private _pad(str: string): string {
    const { digits } = this;
    return str.length > digits ? str : str.padEnd(digits, this._middle);
  }
}
