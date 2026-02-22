import type { MindMapNode, TraversalTargets } from "@/mindmap/types";

interface ParentIndexResult {
  parent: MindMapNode | null;
  node: MindMapNode;
  index: number;
}

export function findNodeById(
  root: MindMapNode,
  nodeId: number,
): MindMapNode | null {
  if (root.id === nodeId) {
    return root;
  }

  for (const child of root.children) {
    const match = findNodeById(child, nodeId);

    if (match) {
      return match;
    }
  }

  return null;
}

function findParentAndIndex(
  node: MindMapNode,
  targetId: number,
  parent: MindMapNode | null = null,
  index = -1,
): ParentIndexResult | null {
  if (node.id === targetId) {
    return { parent, node, index };
  }

  for (let childIndex = 0; childIndex < node.children.length; childIndex += 1) {
    const child = node.children[childIndex];
    const result = findParentAndIndex(child, targetId, node, childIndex);

    if (result) {
      return result;
    }
  }

  return null;
}

export function getTraversalTargets(
  root: MindMapNode,
  nodeId: number,
): TraversalTargets {
  const current = findNodeById(root, nodeId);

  if (!current) {
    return {
      parentId: null,
      firstChildId: null,
      leftSiblingId: null,
      rightSiblingId: null,
    };
  }

  const parentAndIndex = findParentAndIndex(root, nodeId);

  if (!parentAndIndex) {
    return {
      parentId: null,
      firstChildId: current.children[0]?.id ?? null,
      leftSiblingId: null,
      rightSiblingId: null,
    };
  }

  const { parent, index } = parentAndIndex;

  const leftSiblingId =
    parent && index > 0 ? parent.children[index - 1].id : null;
  const rightSiblingId =
    parent && index >= 0 && index < parent.children.length - 1
      ? parent.children[index + 1].id
      : null;

  return {
    parentId: parent?.id ?? null,
    firstChildId: current.children[0]?.id ?? null,
    leftSiblingId,
    rightSiblingId,
  };
}

export function getMaxNodeId(root: MindMapNode): number {
  return root.children.reduce((maxId, child) => {
    const childMaxId = getMaxNodeId(child);
    return Math.max(maxId, childMaxId);
  }, root.id);
}

export function updateNodeById(
  node: MindMapNode,
  targetId: number,
  updater: (targetNode: MindMapNode) => MindMapNode,
): MindMapNode {
  if (node.id === targetId) {
    return updater(node);
  }

  return {
    ...node,
    children: node.children.map((child) =>
      updateNodeById(child, targetId, updater),
    ),
  };
}

export function addChildNode(
  root: MindMapNode,
  parentId: number,
): { root: MindMapNode; childId: number } {
  const parentNode = findNodeById(root, parentId);

  if (!parentNode) {
    return { root, childId: parentId };
  }

  const childId = getMaxNodeId(root) + 1;

  const childNode: MindMapNode = {
    id: childId,
    level: parentNode.level + 1,
    title: "TITLE",
    contents: "",
    children: [],
  };

  const updatedRoot = updateNodeById(root, parentId, (targetNode) => ({
    ...targetNode,
    children: [...targetNode.children, childNode],
  }));

  return { root: updatedRoot, childId };
}

export function deleteNodeById(
  root: MindMapNode,
  targetId: number,
): MindMapNode {
  if (root.id === targetId) {
    return root;
  }

  return {
    ...root,
    children: root.children
      .filter((child) => child.id !== targetId)
      .map((child) => deleteNodeById(child, targetId)),
  };
}
