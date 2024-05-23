"use client";

import { useState, useRef, useEffect } from "react";

const ChatBox = () => {
  const [messages, setMessages] = useState<{ sender: string; text: string }[]>([
    { sender: "bot", text: "Bot reply to: Hello there!" },
  ]);

  const [input, setInput] = useState("");
  const messageEndRef = useRef<HTMLDivElement>(null);
  const [hoveredMessageIndex, setHoveredMessageIndex] = useState<number | null>(
    null
  );

  const getBotResponse = (userMessage: string): string => {
    // 模拟的机器人回复逻辑
    return `Bot reply to: ${userMessage}`;
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage = { sender: "user", text: input };
    setMessages([...messages, userMessage]);

    // 模拟获取机器人回复
    const botMessage = { sender: "bot", text: getBotResponse(input) };

    setMessages((prevMessages) => [...prevMessages, botMessage]);
    setInput("");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(
      () => {
        alert("Copied to clipboard");
      },
      (err) => {
        console.error("Could not copy text: ", err);
      }
    );
  };

  useEffect(() => {
    if (messageEndRef.current) {
      messageEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex items-center justify-center h-screen bg-gray-200">
      <div className="flex flex-col h-full p-4 bg-gray-100 w-full max-w-2xl mx-auto">
        <div className="flex-grow overflow-auto p-4 bg-white rounded shadow mb-4 h-[70vh] no-scrollbar">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`relative flex flex-col my-2 ${
                msg.sender === "user" ? "items-end" : "items-start"
              }`}
              onMouseEnter={() => setHoveredMessageIndex(index)}
              onMouseLeave={() => setHoveredMessageIndex(null)}
              style={{ height: "auto", minHeight: "60px", width: "100%" }} // 设置最小高度
            >
              <div
                className={`relative p-2 rounded max-w-[50%] w-full cursor-pointer ${
                  msg.sender === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-300 text-black"
                }`}
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "space-between",
                }}
              >
                <div style={{ flex: 1 }}>{msg.text}</div>
                <div
                  className={`flex justify-start items-center ${
                    hoveredMessageIndex === index ? "flex" : "hidden"
                  }`}
                  style={{ height: "15px" }} // 设置菜单栏高度
                >
                  <div className="rounded shadow-lg">
                    <button
                      onClick={() => copyToClipboard(msg.text)}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      Copy
                    </button>
                    {/* 可以在这里添加更多的操作按钮 */}
                  </div>
                </div>
              </div>
            </div>
          ))}
          <div ref={messageEndRef}></div>
        </div>
        <div className="flex">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-grow p-2 border rounded-l"
          />
          <button
            onClick={sendMessage}
            className="p-2 bg-blue-500 text-white rounded-r cursor-pointer"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
