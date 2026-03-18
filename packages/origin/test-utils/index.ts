/**
 * Test utilities for Origin components
 *
 * Includes conformance tests adapted from Base UI patterns.
 * @see https://github.com/mui/base-ui/tree/master/packages/react/test
 */

// Playwright CT conformance utilities (real browser)
export {
  createConformanceTests,
  conformanceAssertions,
  type ConformanceTestOptions,
} from './describeConformance';

// Vitest/unit test conformance utilities (JSDOM - fast)
export {
  describeConformance,
  conformanceTests,
  type ConformanceOptions,
} from './describeConformance.unit';
