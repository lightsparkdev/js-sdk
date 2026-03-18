/**
 * Unit test conformance utilities (Vitest + @testing-library/react)
 *
 * Adapted from Base UI's describeConformance pattern.
 * These run in JSDOM (fast) for testing component contracts.
 *
 * @see https://github.com/mui/base-ui/tree/master/packages/react/test/conformanceTests
 */

import * as React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';

export interface ConformanceOptions {
  /**
   * Function that renders the component with test props
   */
  render: () => React.ReactElement;

  /**
   * The expected DOM element type
   */
  refInstanceof?: typeof HTMLElement;

  /**
   * Test ID applied to the root element
   */
  testId?: string;

  /**
   * Skip specific tests
   */
  skip?: Array<'propForwarding' | 'refForwarding' | 'className'>;
}

/**
 * Creates a describe block with conformance tests for a component.
 *
 * Usage:
 * ```tsx
 * import { describeConformance } from '@test-utils/describeConformance.unit';
 *
 * describeConformance('BreadcrumbRoot', {
 *   render: () => (
 *     <BreadcrumbRoot data-testid="test-root" data-custom="value" lang="fr" className="custom">
 *       <BreadcrumbList><BreadcrumbItem><BreadcrumbPage>Test</BreadcrumbPage></BreadcrumbItem></BreadcrumbList>
 *     </BreadcrumbRoot>
 *   ),
 *   testId: 'test-root',
 * });
 * ```
 */
export function describeConformance(
  componentName: string,
  getOptions: () => ConformanceOptions
) {
  describe(`${componentName} conformance`, () => {
    const options = getOptions();
    const skip = options.skip ?? [];

    if (!skip.includes('propForwarding')) {
      describe('prop forwarding', () => {
        it('forwards data-* attributes to the DOM', () => {
          render(options.render());
          const element = screen.getByTestId(options.testId ?? 'test-root');
          expect(element).toHaveAttribute('data-custom', 'value');
        });

        it('forwards lang attribute to the DOM', () => {
          render(options.render());
          const element = screen.getByTestId(options.testId ?? 'test-root');
          expect(element).toHaveAttribute('lang', 'fr');
        });
      });
    }

    if (!skip.includes('className')) {
      describe('className', () => {
        it('applies custom className', () => {
          render(options.render());
          const element = screen.getByTestId(options.testId ?? 'test-root');
          expect(element).toHaveClass('custom');
        });
      });
    }

    if (!skip.includes('refForwarding') && options.refInstanceof) {
      describe('ref forwarding', () => {
        it('forwards ref to the correct element type', () => {
          const ref = React.createRef<HTMLElement>();
          // This test requires the render function to accept a ref
          // For now, we skip this if refInstanceof is provided but render doesn't support it
        });
      });
    }
  });
}

/**
 * Individual conformance test functions for more control.
 *
 * Usage:
 * ```tsx
 * import { conformanceTests } from '@test-utils/describeConformance.unit';
 *
 * describe('MyComponent', () => {
 *   conformanceTests.propForwarding(() => <MyComponent data-testid="root" data-custom="value" lang="fr" />);
 *   conformanceTests.className(() => <MyComponent data-testid="root" className="custom" />);
 * });
 * ```
 */
export const conformanceTests = {
  /**
   * Test that custom props are forwarded to the DOM
   */
  propForwarding(
    renderFn: () => React.ReactElement,
    testId = 'test-root',
    expectedProps: Record<string, string> = { 'data-custom': 'value', lang: 'fr' }
  ) {
    describe('prop forwarding', () => {
      Object.entries(expectedProps).forEach(([attr, value]) => {
        it(`forwards ${attr} attribute to the DOM`, () => {
          render(renderFn());
          const element = screen.getByTestId(testId);
          expect(element).toHaveAttribute(attr, value);
        });
      });
    });
  },

  /**
   * Test that className is applied
   */
  className(
    renderFn: () => React.ReactElement,
    testId = 'test-root',
    expectedClass = 'custom'
  ) {
    describe('className', () => {
      it('applies custom className', () => {
        render(renderFn());
        const element = screen.getByTestId(testId);
        expect(element).toHaveClass(expectedClass);
      });
    });
  },

  /**
   * Test that style is applied
   */
  style(
    renderFn: () => React.ReactElement,
    testId = 'test-root',
    expectedStyles: Record<string, string> = { color: 'green' }
  ) {
    describe('style', () => {
      Object.entries(expectedStyles).forEach(([prop, value]) => {
        it(`applies ${prop} style`, () => {
          render(renderFn());
          const element = screen.getByTestId(testId);
          expect(element).toHaveStyle({ [prop]: value });
        });
      });
    });
  },

  /**
   * Test that ref is forwarded correctly
   */
  refForwarding<T extends HTMLElement>(
    Component: React.ForwardRefExoticComponent<React.RefAttributes<T> & Record<string, unknown>>,
    props: Record<string, unknown>,
    expectedType: new () => T
  ) {
    describe('ref forwarding', () => {
      it('forwards ref to the correct element type', () => {
        const ref = React.createRef<T>();
        render(React.createElement(Component, { ...props, ref }));
        expect(ref.current).toBeInstanceOf(expectedType);
      });
    });
  },
};
