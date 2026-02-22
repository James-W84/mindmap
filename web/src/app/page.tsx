"use client";

import { useEffect, useMemo, useState } from "react";
import {
  DEFAULT_CURRENT_NODE_ID,
  DEFAULT_ROOT_NODE,
} from "@/mindmap/defaultMap";
import {
  loadMindMapFromStorage,
  saveMindMapToStorage,
} from "@/mindmap/storage";
import {
  addChildNode,
  deleteNodeById,
  findNodeById,
  getTraversalTargets,
  updateNodeById,
} from "@/mindmap/tree";
import styles from "./page.module.css";

export default function Home() {
  const [root, setRoot] = useState(() => {
    const stored = loadMindMapFromStorage();
    return stored?.root ?? DEFAULT_ROOT_NODE;
  });
  const [currentNodeId, setCurrentNodeId] = useState(() => {
    const stored = loadMindMapFromStorage();

    if (!stored) {
      return DEFAULT_CURRENT_NODE_ID;
    }

    return findNodeById(stored.root, stored.currentNodeId)
      ? stored.currentNodeId
      : stored.root.id;
  });
  const [isPanelOpen, setIsPanelOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isDeleteConfirming, setIsDeleteConfirming] = useState(false);
  const [draftTitle, setDraftTitle] = useState("");
  const [draftContents, setDraftContents] = useState("");
  const [transitionMode, setTransitionMode] = useState<
    "zoomIn" | "zoomOut" | "steady"
  >("steady");

  useEffect(() => {
    const normalizedCurrentNodeId = findNodeById(root, currentNodeId)
      ? currentNodeId
      : root.id;
    saveMindMapToStorage({ root, currentNodeId: normalizedCurrentNodeId });
  }, [currentNodeId, root]);

  const currentNode = useMemo(
    () => findNodeById(root, currentNodeId) ?? root,
    [currentNodeId, root],
  );
  const traversalTargets = getTraversalTargets(root, currentNode.id);

  const closePanelAndModes = () => {
    setIsPanelOpen(false);
    setIsEditMode(false);
    setIsDeleteConfirming(false);
  };

  const navigateToNode = (nextNodeId: number) => {
    if (nextNodeId === currentNode.id) {
      return;
    }

    const targetNode = findNodeById(root, nextNodeId);

    if (targetNode) {
      if (targetNode.level > currentNode.level) {
        setTransitionMode("zoomIn");
      } else if (targetNode.level < currentNode.level) {
        setTransitionMode("zoomOut");
      } else {
        setTransitionMode("steady");
      }
    }

    setCurrentNodeId(nextNodeId);
    closePanelAndModes();
  };

  const childPositions = useMemo(() => {
    if (currentNode.children.length === 0) {
      return [] as Array<{
        id: number;
        title: string;
        x: number;
        y: number;
        angle: number;
        startX: number;
        startY: number;
        lineLength: number;
      }>;
    }

    const startAngle = -145;
    const endAngle = 55;
    const radius = 240;
    const parentRadius = 170;
    const childRadius = 48;

    return currentNode.children.map((child, index) => {
      const ratio =
        currentNode.children.length === 1
          ? 0.5
          : index / (currentNode.children.length - 1);
      const angle = startAngle + ratio * (endAngle - startAngle);
      const radians = (angle * Math.PI) / 180;
      const x = Math.cos(radians) * radius;
      const y = Math.sin(radians) * radius;
      const distance = Math.hypot(x, y);
      const unitX = x / distance;
      const unitY = y / distance;
      const startX = unitX * parentRadius;
      const startY = unitY * parentRadius;
      const lineLength = Math.max(distance - parentRadius - childRadius, 12);

      return {
        id: child.id,
        title: child.title,
        x,
        y,
        angle,
        startX,
        startY,
        lineLength,
      };
    });
  }, [currentNode.children]);

  const openPanel = () => {
    setIsPanelOpen(true);
    setIsEditMode(false);
    setIsDeleteConfirming(false);
    setDraftTitle(currentNode.title);
    setDraftContents(currentNode.contents);
  };

  const handleCurrentNodeClick = () => {
    if (isPanelOpen) {
      closePanelAndModes();
      return;
    }

    openPanel();
  };

  const handleMoveToParent = () => {
    if (traversalTargets.parentId === null) {
      return;
    }

    navigateToNode(traversalTargets.parentId);
  };

  const handleAddChild = () => {
    const { root: nextRoot, childId } = addChildNode(root, currentNode.id);
    setTransitionMode("zoomIn");
    setRoot(nextRoot);
    setCurrentNodeId(childId);
    closePanelAndModes();
  };

  const handleSelectChild = (nodeId: number) => {
    navigateToNode(nodeId);
  };

  const handleSave = () => {
    const normalizedTitle = draftTitle.trim() || "Untitled";

    setRoot((prevRoot) =>
      updateNodeById(prevRoot, currentNode.id, (node) => ({
        ...node,
        title: normalizedTitle,
        contents: draftContents,
      })),
    );
    setIsEditMode(false);
    setIsDeleteConfirming(false);
  };

  const handleDelete = () => {
    if (currentNode.id === root.id) {
      return;
    }

    if (!isDeleteConfirming) {
      setIsDeleteConfirming(true);
      return;
    }

    const fallbackNodeId = traversalTargets.parentId ?? root.id;
    setRoot((prevRoot) => deleteNodeById(prevRoot, currentNode.id));
    setTransitionMode("zoomOut");
    setCurrentNodeId(fallbackNodeId);
    closePanelAndModes();
  };

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const targetTag = target?.tagName.toLowerCase();
      const isTypingTarget = targetTag === "input" || targetTag === "textarea";

      if (isTypingTarget && event.key !== "Escape") {
        return;
      }

      if (event.key === "ArrowUp" && traversalTargets.parentId !== null) {
        event.preventDefault();
        const targetNode = findNodeById(root, traversalTargets.parentId);
        if (targetNode) {
          if (targetNode.level > currentNode.level) {
            setTransitionMode("zoomIn");
          } else if (targetNode.level < currentNode.level) {
            setTransitionMode("zoomOut");
          } else {
            setTransitionMode("steady");
          }
        }
        setCurrentNodeId(traversalTargets.parentId);
        setIsPanelOpen(false);
        setIsEditMode(false);
        setIsDeleteConfirming(false);
        return;
      }

      if (event.key === "ArrowDown" && traversalTargets.firstChildId !== null) {
        event.preventDefault();
        const targetNode = findNodeById(root, traversalTargets.firstChildId);
        if (targetNode) {
          if (targetNode.level > currentNode.level) {
            setTransitionMode("zoomIn");
          } else if (targetNode.level < currentNode.level) {
            setTransitionMode("zoomOut");
          } else {
            setTransitionMode("steady");
          }
        }
        setCurrentNodeId(traversalTargets.firstChildId);
        setIsPanelOpen(false);
        setIsEditMode(false);
        setIsDeleteConfirming(false);
        return;
      }

      if (
        event.key === "ArrowLeft" &&
        traversalTargets.leftSiblingId !== null
      ) {
        event.preventDefault();
        const targetNode = findNodeById(root, traversalTargets.leftSiblingId);
        if (targetNode) {
          if (targetNode.level > currentNode.level) {
            setTransitionMode("zoomIn");
          } else if (targetNode.level < currentNode.level) {
            setTransitionMode("zoomOut");
          } else {
            setTransitionMode("steady");
          }
        }
        setCurrentNodeId(traversalTargets.leftSiblingId);
        setIsPanelOpen(false);
        setIsEditMode(false);
        setIsDeleteConfirming(false);
        return;
      }

      if (
        event.key === "ArrowRight" &&
        traversalTargets.rightSiblingId !== null
      ) {
        event.preventDefault();
        const targetNode = findNodeById(root, traversalTargets.rightSiblingId);
        if (targetNode) {
          if (targetNode.level > currentNode.level) {
            setTransitionMode("zoomIn");
          } else if (targetNode.level < currentNode.level) {
            setTransitionMode("zoomOut");
          } else {
            setTransitionMode("steady");
          }
        }
        setCurrentNodeId(traversalTargets.rightSiblingId);
        setIsPanelOpen(false);
        setIsEditMode(false);
        setIsDeleteConfirming(false);
        return;
      }

      if (event.code === "Space") {
        event.preventDefault();
        const { root: nextRoot, childId } = addChildNode(root, currentNode.id);
        setTransitionMode("zoomIn");
        setRoot(nextRoot);
        setCurrentNodeId(childId);
        setIsPanelOpen(false);
        setIsEditMode(false);
        setIsDeleteConfirming(false);
        return;
      }

      if (event.key === "Enter") {
        event.preventDefault();
        setIsPanelOpen(true);
        setIsEditMode(false);
        setIsDeleteConfirming(false);
        setDraftTitle(currentNode.title);
        setDraftContents(currentNode.contents);
      }

      if (event.key === "Escape") {
        setIsEditMode(false);
        setIsDeleteConfirming(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [
    currentNode.contents,
    currentNode.id,
    currentNode.level,
    currentNode.title,
    root,
    traversalTargets.firstChildId,
    traversalTargets.leftSiblingId,
    traversalTargets.parentId,
    traversalTargets.rightSiblingId,
  ]);

  const canDelete = currentNode.id !== root.id;

  return (
    <div className={styles.page}>
      <main className={styles.workspace}>
        <section className={styles.canvasPane}>
          <div className={styles.controls}>
            {traversalTargets.parentId !== null && (
              <button
                className={styles.controlButton}
                type="button"
                onClick={handleMoveToParent}
              >
                Back to Parent
              </button>
            )}
            <button
              className={styles.controlButton}
              type="button"
              onClick={handleAddChild}
            >
              Add Child Node
            </button>
          </div>

          <div className={styles.canvasArea}>
            <div
              className={`${styles.nodeLayer} ${styles[transitionMode]}`}
              key={currentNode.id}
            >
              {childPositions.map((child) => {
                return (
                  <div key={child.id}>
                    <div
                      className={styles.connector}
                      style={{
                        width: `${child.lineLength}px`,
                        left: `calc(50% + ${child.startX}px)`,
                        top: `calc(50% + ${child.startY}px)`,
                        transform: `translate(0, -50%) rotate(${child.angle}deg)`,
                      }}
                    />
                    <button
                      className={styles.childNode}
                      type="button"
                      style={{
                        left: `calc(50% + ${child.x}px)`,
                        top: `calc(50% + ${child.y}px)`,
                      }}
                      onClick={() => handleSelectChild(child.id)}
                    >
                      {child.title || "Untitled"}
                    </button>
                  </div>
                );
              })}

              <button
                className={styles.currentNode}
                type="button"
                onClick={handleCurrentNodeClick}
              >
                <h1>{currentNode.title || "Untitled"}</h1>
                <p>{currentNode.contents}</p>
              </button>
            </div>

            <div className={styles.shortcutsCard}>
              <h3>Shortcuts</h3>
              <ul>
                <li>
                  <span>Parent</span>
                  <kbd>↑</kbd>
                </li>
                <li>
                  <span>First Child</span>
                  <kbd>↓</kbd>
                </li>
                <li>
                  <span>Siblings</span>
                  <kbd>←</kbd>
                  <kbd>→</kbd>
                </li>
                <li>
                  <span>Open Panel</span>
                  <kbd>Enter</kbd>
                </li>
                <li>
                  <span>Add Child</span>
                  <kbd>Space</kbd>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {isPanelOpen && (
          <aside className={styles.sidePanel}>
            <div className={styles.panelCard}>
              {!isEditMode ? (
                <>
                  <h2>{currentNode.title || "Untitled"}</h2>
                  <p>{currentNode.contents || "No content yet."}</p>
                </>
              ) : (
                <>
                  <label className={styles.fieldLabel} htmlFor="node-title">
                    Title
                  </label>
                  <input
                    id="node-title"
                    className={styles.textInput}
                    value={draftTitle}
                    onChange={(event) => setDraftTitle(event.target.value)}
                  />

                  <label className={styles.fieldLabel} htmlFor="node-contents">
                    Contents
                  </label>
                  <textarea
                    id="node-contents"
                    className={styles.textArea}
                    value={draftContents}
                    onChange={(event) => setDraftContents(event.target.value)}
                  />
                </>
              )}

              <div className={styles.panelActions}>
                {!isEditMode ? (
                  <button
                    className={styles.panelButton}
                    type="button"
                    onClick={() => setIsEditMode(true)}
                  >
                    Edit
                  </button>
                ) : (
                  <>
                    <button
                      className={styles.panelButton}
                      type="button"
                      onClick={handleSave}
                    >
                      Save
                    </button>
                    <button
                      className={styles.panelButtonSecondary}
                      type="button"
                      onClick={() => {
                        setIsEditMode(false);
                        setDraftTitle(currentNode.title);
                        setDraftContents(currentNode.contents);
                      }}
                    >
                      Cancel
                    </button>
                  </>
                )}

                <button
                  className={styles.panelButtonSecondary}
                  type="button"
                  onClick={() => {
                    setIsPanelOpen(false);
                    setIsEditMode(false);
                    setIsDeleteConfirming(false);
                  }}
                >
                  Close
                </button>
              </div>

              {canDelete && (
                <div className={styles.deleteRow}>
                  <button
                    className={
                      isDeleteConfirming
                        ? styles.deleteButtonConfirm
                        : styles.deleteButton
                    }
                    type="button"
                    onClick={handleDelete}
                  >
                    {isDeleteConfirming ? "Confirm Delete" : "Delete Node"}
                  </button>
                  {isDeleteConfirming && (
                    <button
                      className={styles.panelButtonSecondary}
                      type="button"
                      onClick={() => setIsDeleteConfirming(false)}
                    >
                      Keep Node
                    </button>
                  )}
                </div>
              )}
            </div>
          </aside>
        )}
      </main>
    </div>
  );
}
