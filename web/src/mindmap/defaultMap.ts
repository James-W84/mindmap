import type { MindMapNode } from "@/mindmap/types";

export const DEFAULT_ROOT_NODE: MindMapNode = {
  id: 1,
  level: 0,
  title: "TITLE",
  contents:
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.",
  children: [
    {
      id: 2,
      level: 1,
      title: "TITLE",
      contents: "",
      children: [],
    },
    {
      id: 3,
      level: 1,
      title: "TITLE",
      contents: "",
      children: [],
    },
    {
      id: 4,
      level: 1,
      title: "TITLE",
      contents: "",
      children: [],
    },
  ],
};

export const DEFAULT_CURRENT_NODE_ID = 1;
