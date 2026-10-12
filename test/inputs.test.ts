import { readInputs } from "../src/inputs.js"

const from = (inputs: Record<string, string>) => (name: string) => inputs[name] ?? ""

describe("readInputs", () => {
  it("defaults every input", () => {
    expect(readInputs(from({}))).toEqual({
      path: ".",
      failOn: "error",
      diagrams: true,
      annotations: true,
      summary: true,
    })
  })

  it("reads each input", () => {
    expect(
      readInputs(
        from({
          path: " docs/knowledge ",
          "fail-on": "warning",
          diagrams: "false",
          annotations: "False",
          summary: "TRUE",
        }),
      ),
    ).toEqual({
      path: "docs/knowledge",
      failOn: "warning",
      diagrams: false,
      annotations: false,
      summary: true,
    })
  })

  it("rejects an unknown fail-on", () => {
    expect(() => readInputs(from({ "fail-on": "errors" }))).toThrow(
      'fail-on must be one of error, warning, never (got "errors").',
    )
  })

  it("rejects a boolean input that is not true or false", () => {
    expect(() => readInputs(from({ diagrams: "auto" }))).toThrow(
      'diagrams must be true or false (got "auto").',
    )
  })
})
