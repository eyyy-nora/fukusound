import { Lexorank } from "src/lexorank";

describe("Lexorank", () => {
  it("should generate a lexorank centered between two ranks", () => {
    const ranker = new Lexorank();
    expect(ranker.between("a", "b", false)).toEqual("ai");
    expect(ranker.between("a", "c", false)).toEqual("b");
    expect(ranker.between("aa", "ab", false)).toEqual("aai");
    expect(ranker.between("aaa", "aba", false)).toEqual("aam");
  });
  it("should pad strings for convenience", () => {
    const ranker = new Lexorank();
    expect(ranker.between("a", "b")).toEqual("aiiiii");
    expect(ranker.between("a", "c")).toEqual("biiiii");
  });
  it("should rebalance ranks", () => {
    const ranker = new Lexorank();
    expect(ranker.balance("a", "z", 5, false)).toEqual("chmrw".split(""));
    expect(ranker.balance("aaa", "aab", 9, false)).toEqual(
      "159dhlptx".split("").map(c => "aaa" + c),
    );
  });
  it("should throw on small charsets", () => {
    expect(() => new Lexorank({ charset: "123" })).toThrow();
  });
  it("should rebalance ranks performantly", async () => {
    const ranker = new Lexorank();
    const aa = "a".repeat(10000);
    const aaa = aa + "a";
    const aaz = aa + "z";
    const result = "bdgilnqsvx".split("").map(c => aa + c);
    for (let i = 0; i < 10000; ++i)
      expect(ranker.balance(aaa, aaz, 10, false)).toEqual(result);
  }, 10000);
});
