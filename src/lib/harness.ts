import type { TestCase } from '@/types';

/**
 * Generate a Python test harness that imports the user's solution class,
 * replays operations from test cases, and outputs JSON results.
 *
 * The harness runs alongside `solution.py` via local execution.
 * It handles: init (constructor), method calls with args, return value capture,
 * exception catching per test case.
 *
 * Test data is base64-encoded to avoid string escaping issues.
 */
export function generatePythonHarness(
  className: string,
  testCases: TestCase[],
  includeHidden: boolean = false
): string {
  const serializedTests = JSON.stringify(
    testCases.map((tc, i) => ({
      name: tc.name,
      operations: tc.operations,
      expected: tc.expected,
      hidden: includeHidden ? false : false,
      index: i,
    }))
  );

  // Base64 encode to completely avoid string escaping issues
  const b64 = Buffer.from(serializedTests).toString('base64');

  return `import json
import sys
import io
import base64
import traceback
sys.path.insert(0, '.')

from solution import ${className}

test_cases = json.loads(base64.b64decode("${b64}").decode("utf-8"))

def normalize(val):
    """Normalize a Python return value to JSON-compatible type for comparison.
    Ensures Python values match JSON-native expected values from test files."""
    if val is None:
        return None
    if isinstance(val, bool):
        return val
    if isinstance(val, (int, float)):
        return val
    if isinstance(val, str):
        return val
    if isinstance(val, (list, tuple)):
        return [normalize(v) for v in val]
    if isinstance(val, dict):
        return {str(k): normalize(v) for k, v in val.items()}
    return str(val)

results = []

for tc in test_cases:
    _old_stdout = sys.stdout
    sys.stdout = _captured = io.StringIO()
    actuals = []
    instance = None
    runtime_error = None

    for op in tc["operations"]:
        method_name = op[0]
        args = op[1:]
        try:
            if method_name == "init":
                instance = ${className}(*args)
                actuals.append(None)
            else:
                ret = getattr(instance, method_name)(*args)
                actuals.append(normalize(ret))
        except Exception as e:
            tb = traceback.extract_tb(sys.exc_info()[2])
            loc = ""
            for frame in reversed(tb):
                if frame.filename.endswith("solution.py"):
                    loc = f" (line {frame.lineno})"
                    break
            runtime_error = str(e) + loc
            break

    expected = tc["expected"]
    all_passed = True
    mismatch_index = None

    if runtime_error is not None:
        all_passed = False
        mismatch_index = len(actuals)
    else:
        for j in range(len(expected)):
            if j < len(actuals):
                if expected[j] != actuals[j]:
                    if mismatch_index is None:
                        mismatch_index = j
                    all_passed = False
            else:
                if mismatch_index is None:
                    mismatch_index = j
                all_passed = False

    sys.stdout = _old_stdout
    _stdout_text = _captured.getvalue()

    result_obj = {
        "name": tc["name"],
        "passed": all_passed,
        "expected": json.dumps(expected),
        "actual": json.dumps(actuals),
        "index": tc["index"],
        "stdout": _stdout_text
    }
    if mismatch_index is not None:
        result_obj["mismatch_index"] = mismatch_index
        if runtime_error is not None:
            result_obj["mismatch_expected"] = json.dumps(expected[mismatch_index] if mismatch_index < len(expected) else None)
            result_obj["mismatch_actual"] = json.dumps("Error: " + runtime_error)
        else:
            result_obj["mismatch_expected"] = json.dumps(expected[mismatch_index] if mismatch_index < len(expected) else None)
            result_obj["mismatch_actual"] = json.dumps(actuals[mismatch_index] if mismatch_index < len(actuals) else None)
        if mismatch_index < len(tc["operations"]):
            result_obj["mismatch_operation"] = tc["operations"][mismatch_index]
    results.append(result_obj)

print("__HARNESS_RESULT__")
print(json.dumps(results))
`;
}

/**
 * Generate a JavaScript test harness that imports the user's solution class,
 * replays operations from test cases, and outputs JSON results.
 *
 * Same marker pattern as the Python harness.
 */
export function generateJavaScriptHarness(
  className: string,
  testCases: TestCase[],
  includeHidden: boolean = false
): string {
  const serializedTests = JSON.stringify(
    testCases.map((tc, i) => ({
      name: tc.name,
      operations: tc.operations,
      expected: tc.expected,
      hidden: includeHidden ? false : false,
      index: i,
    }))
  );

  const b64 = Buffer.from(serializedTests).toString('base64');

  return `const { ${className} } = require('./solution');

const testCases = JSON.parse(Buffer.from("${b64}", "base64").toString("utf-8"));

function toString(val) {
  if (val === null || val === undefined) return "";
  if (typeof val === "boolean") return val ? "True" : "False";
  if (Array.isArray(val)) {
    const inner = val.map(v => {
      if (typeof v === "string") return "'" + v + "'";
      if (typeof v === "boolean") return v ? "True" : "False";
      if (v === null || v === undefined) return "None";
      if (typeof v === "object") return dictToString(v);
      return String(v);
    }).join(", ");
    return "[" + inner + "]";
  }
  if (typeof val === "object") return dictToString(val);
  return String(val);
}

function dictToString(obj) {
  const entries = Object.entries(obj).map(([k, v]) => {
    const key = "'" + k + "'";
    let val;
    if (typeof v === "string") val = "'" + v + "'";
    else if (typeof v === "boolean") val = v ? "True" : "False";
    else if (v === null || v === undefined) val = "None";
    else if (Array.isArray(v)) val = toString(v);
    else if (typeof v === "object") val = dictToString(v);
    else val = String(v);
    return key + ": " + val;
  }).join(", ");
  return "{" + entries + "}";
}

const results = [];

for (const tc of testCases) {
  try {
    const actuals = [];
    let instance = null;
    for (const op of tc.operations) {
      const methodName = op[0];
      const args = op.slice(1);
      if (methodName === "init") {
        instance = new ${className}(...args);
        actuals.push("");
      } else {
        const ret = instance[methodName](...args);
        if (ret === null || ret === undefined) {
          actuals.push("");
        } else {
          actuals.push(toString(ret));
        }
      }
    }

    const expected = tc.expected;
    let allPassed = true;
    for (let j = 0; j < expected.length; j++) {
      if (j < actuals.length) {
        if (expected[j] !== actuals[j]) allPassed = false;
      } else {
        allPassed = false;
      }
    }

    results.push({
      name: tc.name,
      passed: allPassed,
      expected: JSON.stringify(expected),
      actual: JSON.stringify(actuals),
      index: tc.index,
    });
  } catch (e) {
    results.push({
      name: tc.name,
      passed: false,
      expected: JSON.stringify(tc.expected),
      actual: JSON.stringify(["Error: " + (e instanceof Error ? e.message : String(e))]),
      index: tc.index,
    });
  }
}

console.log("__HARNESS_RESULT__");
console.log(JSON.stringify(results));
`;
}

/**
 * Parse the harness JSON output from stdout.
 * The harness prints a marker line followed by the JSON array.
 */
export function parseHarnessOutput(stdout: string): {
  name: string;
  passed: boolean;
  expected: string;
  actual: string;
  index: number;
  mismatch_index?: number;
  mismatch_expected?: string;
  mismatch_actual?: string;
  mismatch_operation?: (string | number | boolean | null)[];
  stdout?: string;
}[] | null {
  const marker = '__HARNESS_RESULT__';
  const markerIdx = stdout.indexOf(marker);
  if (markerIdx === -1) return null;

  const jsonStr = stdout.slice(markerIdx + marker.length).trim();
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}
