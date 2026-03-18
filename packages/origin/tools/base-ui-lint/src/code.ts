/**
 * Base UI Lint - Figma Plugin
 * 
 * Lints Figma component structures against Base UI anatomy
 * and auto-fixes frame names.
 */

import { lintComponent, type LintResult } from './lint-engine';
import { getComponentRules, type ComponentRules } from './rules';

// Show the UI
figma.showUI(__html__, { width: 360, height: 480 });

// Track current selection
let currentResults: LintResult[] = [];

/**
 * Run lint on current selection
 */
function runLint(): void {
  const selection = figma.currentPage.selection;
  
  if (selection.length === 0) {
    figma.ui.postMessage({ 
      type: 'lint-results', 
      results: [],
      component: null,
      message: 'Select a component to lint'
    });
    return;
  }
  
  const node = selection[0];
  
  // Find which component rules apply
  const rules = getComponentRules(node.name);
  
  if (!rules) {
    figma.ui.postMessage({ 
      type: 'lint-results', 
      results: [],
      component: node.name,
      message: `No Base UI rules found for "${node.name}"`
    });
    return;
  }
  
  // Run the lint
  currentResults = lintComponent(node, rules);
  
  figma.ui.postMessage({ 
    type: 'lint-results', 
    results: currentResults,
    component: node.name,
    baseUIComponent: rules.component,
    message: null
  });
}

/**
 * Apply all auto-fixes
 */
function applyFixes(): void {
  let fixCount = 0;
  
  for (const result of currentResults) {
    if (result.status === 'rename' && result.suggestedName) {
      // Fix ALL nodes with this issue (across all variants)
      if (result.nodes && result.nodes.length > 0) {
        for (const node of result.nodes) {
          node.name = result.suggestedName;
          fixCount++;
        }
      } else if (result.node) {
        // Fallback to single node
        result.node.name = result.suggestedName;
        fixCount++;
      }
    }
  }
  
  // Re-run lint to show updated state
  runLint();
  
  figma.notify(`Fixed ${fixCount} node${fixCount !== 1 ? 's' : ''} across all variants`);
}

// Handle messages from UI
figma.ui.onmessage = (msg: { type: string }) => {
  if (msg.type === 'run-lint') {
    runLint();
  } else if (msg.type === 'apply-fixes') {
    applyFixes();
  } else if (msg.type === 'close') {
    figma.closePlugin();
  }
};

// Listen for selection changes
figma.on('selectionchange', () => {
  runLint();
});

// Initial lint on load
runLint();

