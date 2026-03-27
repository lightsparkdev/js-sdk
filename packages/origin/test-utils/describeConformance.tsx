/**
 * Conformance tests for Base UI-style components
 *
 * Adapted from Base UI's test patterns for Playwright.
 * Tests component contracts: prop forwarding, ref forwarding, className handling.
 *
 * @see https://github.com/mui/base-ui/tree/master/packages/react/test/conformanceTests
 */

import * as React from 'react';
import { test, expect } from '@playwright/experimental-ct-react';

export interface ConformanceTestOptions {
  /**
   * The component to test
   */
  Component: React.ComponentType<any>;

  /**
   * Props required to render the component
   */
  requiredProps?: Record<string, unknown>;

  /**
   * The expected element type (e.g., HTMLElement, HTMLButtonElement)
   */
  refInstanceof?: string;

  /**
   * The expected default element tag (e.g., 'div', 'button', 'nav')
   */
  expectedTag?: string;

  /**
   * Test ID to use for locating the component
   */
  testId?: string;
}

/**
 * Creates conformance tests for a component.
 *
 * Usage in test files:
 * ```tsx
 * import { createConformanceTests } from '@/test-utils';
 *
 * const { PropForwarding, RefForwarding, ClassName } = createConformanceTests({
 *   Component: BreadcrumbRoot,
 *   requiredProps: { children: <BreadcrumbList /> },
 *   expectedTag: 'nav',
 * });
 *
 * // Then mount each in tests:
 * test('forwards props', async ({ mount }) => {
 *   const component = await mount(<PropForwarding />);
 *   // assertions...
 * });
 * ```
 */
export function createConformanceTests(options: ConformanceTestOptions) {
  const {
    Component,
    requiredProps = {},
    expectedTag = 'div',
    testId = 'test-root',
  } = options;

  // Test fixture: Prop forwarding
  function PropForwarding() {
    return (
      <Component
        data-testid={testId}
        data-custom="custom-value"
        lang="fr"
        {...requiredProps}
      />
    );
  }

  // Test fixture: Style forwarding
  function StyleForwarding() {
    return (
      <Component
        data-testid={testId}
        style={{ color: 'green', backgroundColor: 'blue' }}
        {...requiredProps}
      />
    );
  }

  // Test fixture: ClassName as string
  function ClassNameString() {
    return (
      <Component
        data-testid={testId}
        className="custom-class-name"
        {...requiredProps}
      />
    );
  }

  // Test fixture: Ref forwarding
  const RefForwarding = React.forwardRef(function RefForwarding(
    _props: object,
    ref: React.Ref<HTMLElement>
  ) {
    return (
      <Component
        ref={ref}
        data-testid={testId}
        {...requiredProps}
      />
    );
  });

  return {
    PropForwarding,
    StyleForwarding,
    ClassNameString,
    RefForwarding,
    testId,
    expectedTag,
  };
}

/**
 * Inline conformance test functions for use within test.describe blocks.
 *
 * These can be called directly in your tests:
 * ```tsx
 * test.describe('BreadcrumbRoot conformance', () => {
 *   conformanceTests.propForwarding(async ({ mount, page }) => {
 *     const component = await mount(<BreadcrumbRoot data-custom="value" />);
 *     await expect(page.locator('[data-custom="value"]')).toBeVisible();
 *   });
 * });
 * ```
 */
export const conformanceAssertions = {
  /**
   * Assert that custom props are forwarded to the underlying element
   */
  async propForwarding(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locator: any,
    expectedProps: Record<string, string>
  ) {
    for (const [attr, value] of Object.entries(expectedProps)) {
      await expect(locator).toHaveAttribute(attr, value);
    }
  },

  /**
   * Assert that className is applied
   */
  async classNameApplied(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locator: any,
    className: string
  ) {
    await expect(locator).toHaveClass(new RegExp(className));
  },

  /**
   * Assert that style is applied
   */
  async styleApplied(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    locator: any,
    styleProperty: string,
    expectedValue: string
  ) {
    await expect(locator).toHaveCSS(styleProperty, expectedValue);
  },
};
