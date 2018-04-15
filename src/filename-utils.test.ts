import { escapeMarkdownCharacters, getPrettyPathName } from "./filename-utils"
describe("getPrettyPathName", () => {
  it("doesn't change strings equal to the limit", () => {
    const input = "/exactly/17/chars"
    const output = getPrettyPathName(input, 17)
    expect(output).toEqual(input)
  })

  it("elides the middle directories first", () => {
    const input = "/just/over/the/limit"
    const output = getPrettyPathName(input, 17)
    expect(output).toEqual("/just/../limit")
  })

  it("elides the middle directories from right to left, excluding the root directory", () => {
    const input = "/just/over/the/limit"
    const output = getPrettyPathName(input, 18)
    expect(output).toEqual("/just/../the/limit")
  })

  it("elides the root directory second", () => {
    const input = "/quite-a-lot-actually/over/the/limit"
    const output = getPrettyPathName(input, 17)
    expect(output).toEqual("../limit")
  })

  it("truncates the the basename third", () => {
    const input = "/quite-a-lot-actually/over/the/limit-and-this-is-long-as-well"
    const output = getPrettyPathName(input, 17)
    expect(output).toEqual("../limit-and-th..")
  })

  it("treats the tilde as the root directory", () => {
    const input = "~/just/over/the/limit"
    const output = getPrettyPathName(input, 18)
    expect(output).toEqual("~/../the/limit")
  })
})

describe("escapeMarkdownCharacters", () => {
  it("escapes filenames with '|,(,),[,],#,*,{,},-,+,_,!,\\,`>' characters", () => {
    const filename = `src/file-with-characters{[(|#*-+_!\`)]}.ts`
    const expectedFilename = `src/file\\-with\\-characters\\{\\[\\(\\|\\#\\*\\-\\+\\_\\!\\\`\\)\\]\\}.ts`
    const output = escapeMarkdownCharacters(filename)
    expect(output).toEqual(expectedFilename)
  })
})
