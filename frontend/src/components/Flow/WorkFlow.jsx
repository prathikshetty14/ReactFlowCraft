import React, { useState, useEffect, useCallback, useRef } from "react";
import ReactFlow, {
  ReactFlowProvider,
  Background,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
} from "reactflow";
import "reactflow/dist/style.css";

import ColorSelectorNode from "./ColorSelectorNode";
import CustomNode from "./CustomNode";

import "../../index.css";
import { getEachGraphQuery } from "@/src/api/graph";
import Skeleton from "react-loading-skeleton";
import { Loader, Loader2 } from "lucide-react";
import { toast } from "sonner";

const initBgColor = "#000000";

const connectionLineStyle = { stroke: "#fff" };
const snapGrid = [20, 20];
const nodeTypes = {
  selectorNode: ColorSelectorNode,
  custom: CustomNode,
};

const defaultViewport = { x: 0, y: 0, zoom: 1.5 };

let id = 0;
const getId = () => `dndnode_${id++}`;

export default function WorkFlow({
  nodes,
  setNodes,
  onNodesChange,
  edges,
  setEdges,
  onEdgesChange,
  graphId,
  data,
  isLoading,
  isFetching,
  onNodeClick,
}) {
  const reactFlowWrapper = useRef(null);

  const [bgColor, setBgColor] = useState(initBgColor);
  const [reactFlowInstance, setReactFlowInstance] = useState(null);

  // Checking for exisiting nodes through db
  useEffect(() => {
    if (data) {
      setNodes(data.nodes);
      setEdges(data.edges);
    }
  }, [graphId, isLoading]);

  // Setting background color on template nodes
  useEffect(() => {
    if (!graphId) {
      const onChange = (event) => {
        setNodes((nds) =>
          nds.map((node) => {
            if (node.id !== "2") {
              return node;
            }

            const color = event.target.value;

            setBgColor(color);

            return {
              ...node,
              data: {
                ...node.data,
                color,
              },
            };
          })
        );
      };

      setNodes([
        {
          id: "1",
          type: "input",
          data: { label: "An input node" },
          position: { x: 0, y: 50 },
          sourcePosition: "right",
        },
        {
          id: "2",
          type: "selectorNode",
          data: { onChange: onChange, color: initBgColor },
          style: { border: "1px solid #777", padding: 10 },
          position: { x: 300, y: 50 },
        },
        {
          id: "3",
          type: "output",
          data: { label: "Output A" },
          position: { x: 650, y: 25 },
          targetPosition: "left",
        },
        {
          id: "4",
          type: "output",
          data: { label: "Output B" },
          position: { x: 650, y: 100 },
          targetPosition: "left",
        },
      ]);

      setEdges([
        {
          id: "e1-2",
          source: "1",
          target: "2",
          animated: true,
          style: { stroke: "#fff" },
        },
        {
          id: "e2a-3",
          source: "2",
          target: "3",
          sourceHandle: "a",
          animated: true,
          style: { stroke: "#fff" },
        },
        {
          id: "e2b-4",
          source: "2",
          target: "4",
          sourceHandle: "b",
          animated: true,
          style: { stroke: "#fff" },
        },
      ]);
    }
  }, []);

  // function called when nodes are connected
  const onConnect = useCallback(
    (params) =>
      setEdges((eds) =>
        addEdge({ ...params, animated: true, style: { stroke: "#fff" } }, eds)
      ),
    []
  );

  // function called when nodes are dragged
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = "move";
  }, []);

  // function called when nodes are dropped
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const type = event.dataTransfer.getData("application/reactflow");

      // check if the dropped element is valid
      if (typeof type === "undefined" || !type) {
        return;
      }

      // reactFlowInstance.project was renamed to reactFlowInstance.screenToFlowPosition
      // and you don't need to subtract the reactFlowBounds.left/top anymore
      // details: https://reactflow.dev/whats-new/2023-11-10
      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode = {
        id: getId(),
        type,
        position,
        data: { label: `${type} node` },
        style:
          type === "Send"
            ? {
                backgroundColor: "#FECACA",
                color: "black",
                borderRadius: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }
            : type === "Wait"
            ? {
                backgroundColor: "#E9D5FF",
                color: "black",
                borderRadius: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }
            : {
                backgroundColor: "#BBF7D0",
                color: "black",
                borderRadius: 10,
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              },
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance]
  );

  // Loading state if the data is still being fetched
  if (isLoading || isFetching)
    return (
      <div className="flex h-full justify-center items-center">
        {/* <Skeleton height={100} width={1000} count={3} /> */}
        <Loader2 className="h-10 w-10 animate-spin" />
      </div>
    );

  return (
    <>
      <ReactFlowProvider ref={reactFlowWrapper}>
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onNodeClick={onNodeClick}
          onConnect={onConnect}
          style={{ background: bgColor }}
          nodeTypes={nodeTypes}
          connectionLineStyle={connectionLineStyle}
          snapToGrid={true}
          snapGrid={snapGrid}
          defaultViewport={defaultViewport}
          onInit={setReactFlowInstance}
          onDrop={onDrop}
          onDragOver={onDragOver}
          fitView
          attributionPosition="bottom-left"
        >
          <MiniMap
            nodeStrokeColor={(n) => {
              if (n.type === "input") return "#0041d0";
              if (n.type === "selectorNode") return bgColor;
              if (n.type === "output") return "#ff0072";
              return "#373A40";
            }}
            nodeColor={(n) => {
              if (n.type === "selectorNode") return bgColor;
              return "#fff";
            }}
          />
          <Controls />
          <Background />
        </ReactFlow>
      </ReactFlowProvider>
    </>
  );
}
