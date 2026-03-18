/**
 * Lint Engine
 * 
 * Walks the Figma node tree and compares structure against Base UI rules.
 * Handles component sets with multiple variants.
 */

import type { ComponentRules, PartRule } from './rules';

export interface LintResult {
  expectedPart: string;
  status: 'correct' | 'rename' | 'missing';
  foundName?: string;
  suggestedName?: string;
  suggestion?: string;
  node?: SceneNode;
  nodes?: SceneNode[]; // Multiple nodes for same part (across variants)
  parentPart?: string;
}

interface FoundPart {
  name: string;
  node: SceneNode;
  matchedAs: string;
  wasAlias: boolean;
}

/**
 * Normalize a node name for comparison
 */
function normalizeName(name: string): string {
  const segments = name.split('/').map(s => s.trim());
  return segments[segments.length - 1].toLowerCase();
}

/**
 * Check if a node name matches a part name or any of its aliases
 */
function matchesPart(nodeName: string, partName: string, partRule: PartRule): {
  matches: boolean;
  wasAlias: boolean;
} {
  const normalizedNodeName = normalizeName(nodeName);
  const normalizedPartName = partName.toLowerCase();
  
  if (normalizedNodeName === normalizedPartName) {
    return { matches: true, wasAlias: false };
  }
  
  if (partRule.aliases) {
    for (const alias of partRule.aliases) {
      if (normalizedNodeName === alias.toLowerCase()) {
        return { matches: true, wasAlias: true };
      }
    }
  }
  
  return { matches: false, wasAlias: false };
}

/**
 * Check if a node is a component set (has variants)
 */
function isComponentSet(node: SceneNode): node is ComponentSetNode {
  return node.type === 'COMPONENT_SET';
}

/**
 * Check if a node is a component or instance
 */
function isComponentLike(node: SceneNode): node is ComponentNode | InstanceNode {
  return node.type === 'COMPONENT' || node.type === 'INSTANCE';
}

/**
 * Check if a node is a structural element (not a text node, vector, etc.)
 * Only structural nodes can be valid Base UI parts.
 */
function isStructuralNode(node: SceneNode): boolean {
  const structuralTypes: string[] = [
    'FRAME',
    'GROUP',
    'COMPONENT',
    'INSTANCE',
    'COMPONENT_SET',
    'SECTION',
  ];
  return structuralTypes.includes(node.type);
}

/**
 * Recursively find ALL matching parts in a node tree
 * This version collects ALL matches, not just the first one
 * 
 * IMPORTANT: Only structural nodes (frames, groups, components) are considered.
 * Text nodes are ignored because Base UI parts need semantic wrappers.
 */
function findAllPartsInTree(
  node: SceneNode,
  rules: ComponentRules,
  parentPartName: string | null = null,
  depth: number = 0
): FoundPart[] {
  const found: FoundPart[] = [];
  
  // Skip non-structural nodes (TEXT, VECTOR, etc.)
  // These can't be valid Base UI parts - we need frame wrappers
  if (!isStructuralNode(node)) {
    return found;
  }
  
  // Check if this node matches any expected part
  for (const [partName, partRule] of Object.entries(rules.parts)) {
    // Check parent constraint
    if (partRule.parent !== parentPartName) {
      continue;
    }
    
    const match = matchesPart(node.name, partName, partRule);
    if (match.matches) {
      found.push({
        name: node.name,
        node: node,
        matchedAs: partName,
        wasAlias: match.wasAlias
      });
      
      // Recurse into children looking for child parts
      if ('children' in node) {
        for (const child of node.children) {
          found.push(...findAllPartsInTree(child, rules, partName, depth + 1));
        }
      }
      
      // Don't return early - continue checking siblings
      break; // But break inner loop since we found a match for this node
    }
  }
  
  // If node didn't match any part, check if it's ignored
  const didMatch = found.some(f => f.node === node);
  if (!didMatch) {
    const isIgnored = rules.ignored?.some(
      ignored => normalizeName(node.name) === ignored.toLowerCase()
    );
    
    // Continue searching children
    if (!isIgnored && 'children' in node) {
      for (const child of node.children) {
        found.push(...findAllPartsInTree(child, rules, parentPartName, depth + 1));
      }
    }
  }
  
  return found;
}

/**
 * Collect parts from all variants in a component set
 */
function findPartsAcrossVariants(
  rootNode: SceneNode,
  rules: ComponentRules
): FoundPart[] {
  const allFound: FoundPart[] = [];
  
  // If it's a component set, check each variant
  if (isComponentSet(rootNode)) {
    for (const variant of rootNode.children) {
      allFound.push(...findAllPartsInTree(variant, rules, null, 0));
    }
  } 
  // If it's a frame containing component sets, check each one
  else if ('children' in rootNode) {
    // First check the root itself
    allFound.push(...findAllPartsInTree(rootNode, rules, null, 0));
    
    // Then check children that might be component sets
    for (const child of rootNode.children) {
      if (isComponentSet(child)) {
        for (const variant of child.children) {
          allFound.push(...findAllPartsInTree(variant, rules, null, 0));
        }
      } else if (isComponentLike(child)) {
        allFound.push(...findAllPartsInTree(child, rules, null, 0));
      }
    }
  }
  else {
    allFound.push(...findAllPartsInTree(rootNode, rules, null, 0));
  }
  
  return allFound;
}

/**
 * Main lint function - analyzes a component against Base UI rules
 */
export function lintComponent(node: SceneNode, rules: ComponentRules): LintResult[] {
  const results: LintResult[] = [];
  
  // Find all parts across all variants
  const foundParts = findPartsAcrossVariants(node, rules);
  
  // Group found parts by their canonical name
  const foundByPart = new Map<string, FoundPart[]>();
  for (const part of foundParts) {
    const existing = foundByPart.get(part.matchedAs) || [];
    existing.push(part);
    foundByPart.set(part.matchedAs, existing);
  }
  
  // Check each expected part
  for (const [partName, partRule] of Object.entries(rules.parts)) {
    const foundList = foundByPart.get(partName) || [];
    
    if (foundList.length > 0) {
      // Check if any need renaming (found via alias)
      const needsRename = foundList.filter(f => f.wasAlias);
      const correct = foundList.filter(f => !f.wasAlias);
      
      if (needsRename.length > 0) {
        // Some instances need renaming
        results.push({
          expectedPart: partName,
          status: 'rename',
          foundName: needsRename[0].name,
          suggestedName: partName,
          node: needsRename[0].node,
          nodes: needsRename.map(f => f.node), // All nodes to rename
          parentPart: partRule.parent || undefined
        });
      }
      
      if (correct.length > 0 && needsRename.length === 0) {
        // All instances are correct
        results.push({
          expectedPart: partName,
          status: 'correct',
          foundName: correct[0].name,
          node: correct[0].node,
          parentPart: partRule.parent || undefined
        });
      } else if (correct.length > 0 && needsRename.length > 0) {
        // Mixed - some correct, some need rename (already reported rename above)
        // Add info note about correct ones
      }
    } else if (partRule.required) {
      // Required part is missing entirely
      const suggestion = partRule.parent
        ? `Add a frame named "${partName}" inside "${partRule.parent}"`
        : `Add a frame named "${partName}"`;
      
      results.push({
        expectedPart: partName,
        status: 'missing',
        suggestion,
        parentPart: partRule.parent || undefined
      });
    }
  }
  
  // Sort results: missing first, then rename, then correct
  const statusOrder = { missing: 0, rename: 1, correct: 2 };
  results.sort((a, b) => statusOrder[a.status] - statusOrder[b.status]);
  
  return results;
}
