export interface MindMapNode {
  id: number;
  level: number;
  title: string;
  contents: string;
  children: MindMapNode[];
}

export interface MindMapStorageRecord {
  root: MindMapNode;
  currentNodeId: number;
}

export interface TraversalTargets {
  parentId: number | null;
  firstChildId: number | null;
  leftSiblingId: number | null;
  rightSiblingId: number | null;
}
