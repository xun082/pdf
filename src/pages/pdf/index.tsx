"use client";

import { useState, useRef, useEffect } from "react";

import { SpecialZoomLevel, Worker, Viewer } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import { bookmarkPlugin } from "@react-pdf-viewer/bookmark";

import de_DE from "@react-pdf-viewer/locales/lib/zh_CN.json";

import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";
import "@react-pdf-viewer/bookmark/lib/styles/index.css";
import "@react-pdf-viewer/selection-mode/lib/styles/index.css";
import "@/assets/styles/pdf.css";

import linkifyElement from "linkify-element";

const findLinksPlugin = () => {
  const findLinks = (e: {
    status: string;
    ele: { querySelectorAll: (arg0: string) => any[] };
  }) => {
    if (e.status !== "DidRender") {
      return;
    }

    e.ele.querySelectorAll(".rpv-core__text-layer-text").forEach((textEle) => {
      linkifyElement(textEle, {
        attributes: {
          // Custom styles
          style: "color: transparent; text-decoration: none;",
          // Open link in new tab
          target: "_blank",
        },
      });
    });
  };

  return {
    onTextLayerRender: findLinks,
  };
};

export default function ChatDoc() {
  const [pdfFile, setPdfFileUrl] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [selectionPosition, setSelectionPosition] = useState({ x: 0, y: 0 });

  const handleTextSelection = (e: any) => {
    if ((e.target as HTMLElement).closest(".rpv-core__text-layer")) {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        setSelectionPosition({
          x: rect.left + window.scrollX,
          y: rect.bottom + window.scrollY + 10, // 在原来的 y 值基础上增加 10 像素的偏移量
        });
        setSelectedText(selection.toString());
      }
    }
  };

  const performActionWithSelectedText = (action: string) => {
    console.log(`Performing '${action}' on selected text: ${selectedText}`);
    setSelectedText("");
  };

  const tabs = [
    { id: "quote", label: "引用" },
    { id: "rewrite", label: "改写" },
    { id: "explain", label: "解释" },
    { id: "summary", label: "总结" },
    { id: "translate", label: "翻译" },
  ];

  const renderSelectedTextMenu = () => {
    if (!selectedText) return null;

    const menuStyle: React.CSSProperties = {
      position: "absolute",
      top: `${selectionPosition.y}px`,
      left: `${selectionPosition.x}px`,
      zIndex: 1000,
      width: "380px",
      backgroundColor: "#1a2029",
      boxShadow: "0 2px 5px rgba(0, 0, 0, 0.2)",
      borderRadius: "5px",
      display: "flex",
      height: "40px",
      padding: "0 24px",
      boxSizing: "border-box",
      color: "#B6B9C0",
    };

    return (
      <div style={menuStyle}>
        {tabs.map((tab) => (
          <div
            key={tab.id}
            style={{
              cursor: "pointer",
              lineHeight: "40px",
              flex: 1,
              textAlign: "center",
            }}
            onClick={() => performActionWithSelectedText(tab.id)}
          >
            {tab.label}
          </div>
        ))}
      </div>
    );
  };

  const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const fileUrl = URL.createObjectURL(file);
      setPdfFileUrl(fileUrl);
    }
  };

  const bookmarkPluginInstance = bookmarkPlugin();

  const defaultLayoutPluginInstance = defaultLayoutPlugin();

  //   const findLinksPluginInstance = findLinksPlugin();

  const elementRef = useRef<HTMLDivElement>(null);

  // 状态变量来存储高度值
  const [height, setHeight] = useState(0);

  useEffect(() => {
    // 确保元素已经渲染
    if (elementRef.current) {
      setHeight(elementRef.current.clientHeight); // 或者使用 offsetHeight 根据需要
    }
  }, []);

  return (
    <div style={{ height: "600px", width: "100%" }} ref={elementRef}>
      <input type="file" accept="application/pdf" onChange={onFileChange} />
      <div
        style={{
          height: height + "px",
          width: "100%", // 设置PDF查看器的固定高度
          overflow: "auto", // 添加滚动条
        }}
      >
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
          {pdfFile && (
            <div
              style={{
                display: "flex",
                height: "100%",
              }}
            >
              <div style={{ flex: 1 }} onMouseUp={handleTextSelection}>
                <Viewer
                  theme="auto"
                  fileUrl={pdfFile}
                  localization={de_DE}
                  defaultScale={SpecialZoomLevel.PageWidth}
                  plugins={[
                    defaultLayoutPluginInstance,
                    bookmarkPluginInstance,
                  ]}
                />
              </div>
            </div>
          )}
          {renderSelectedTextMenu()}
        </Worker>
      </div>
    </div>
  );
}
