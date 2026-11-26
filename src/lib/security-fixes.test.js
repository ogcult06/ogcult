import { describe, expect, test } from "bun:test";
import { escapeCsvCell } from "./order-utils";

describe("escapeCsvCell spreadsheet formula neutralization", () => {
  test("neutralizes leading formula trigger characters", () => {
    expect(escapeCsvCell("=CMD|' /C calc'!A0")).toBe(`"'=CMD|' /C calc'!A0"`);
    expect(escapeCsvCell("+1+1")).toBe(`"'+1+1"`);
    expect(escapeCsvCell("-2+3")).toBe(`"'-2+3"`);
    expect(escapeCsvCell("@SUM(1+1)")).toBe(`"'@SUM(1+1)"`);
    expect(escapeCsvCell("\t=1+1")).toBe(`"'\t=1+1"`);
    expect(escapeCsvCell("\r=1+1")).toBe(`"'\r=1+1"`);
    expect(escapeCsvCell(`  =HYPERLINK("https://evil.example")`)).toBe(
      `"'  =HYPERLINK(""https://evil.example"")"`,
    );
  });

  test("preserves normal text and escapes double quotes", () => {
    expect(escapeCsvCell("OG-1001")).toBe(`"OG-1001"`);
    expect(escapeCsvCell(1199)).toBe(`"1199"`);
    expect(escapeCsvCell(`Leave at "gate"`)).toBe(`"Leave at ""gate"""`);
    expect(escapeCsvCell(null)).toBe(`""`);
  });
});