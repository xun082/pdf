"use client";

import { useEffect, useRef, useState } from "react";
import { FiSend } from "react-icons/fi";
import useAutoResizeTextArea from "@/hooks/useAutoResizeTextArea";
import Message from "@/components/message";
import { DEFAULT_OPENAI_MODEL } from "@/shared/Constants";

const Chat = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showEmptyChat, setShowEmptyChat] = useState(true);
  const [conversation, setConversation] = useState<
    { content: string | null; role: string }[]
  >([]);
  const [message, setMessage] = useState("1");
  const textAreaRef = useAutoResizeTextArea();
  const bottomOfChatRef = useRef<HTMLDivElement>(null);
  const selectedModel = DEFAULT_OPENAI_MODEL;

  useEffect(() => {
    if (textAreaRef.current) {
      textAreaRef.current.style.height = "24px";
      textAreaRef.current.style.height = `${textAreaRef.current.scrollHeight}px`;
    }
  }, [message, textAreaRef]);

  useEffect(() => {
    if (bottomOfChatRef.current) {
      bottomOfChatRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [conversation]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();

    if (message.trim().length < 1) {
      setErrorMessage("Please enter a message.");
      return;
    }

    setErrorMessage("");
    setIsLoading(true);

    const newConversation = [
      ...conversation,
      { content: message, role: "user" },
      { content: null, role: "system" },
    ];
    setConversation(newConversation);
    setMessage("");
    setShowEmptyChat(false);

    try {
      const response = await fetch(`/api/openai`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [...conversation, { content: message, role: "user" }],
          model: selectedModel,
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setConversation([
          ...conversation,
          { content: message, role: "user" },
          { content: data.message, role: "system" },
        ]);
      } else {
        setErrorMessage(response.statusText);
      }
    } catch (error: any) {
      setErrorMessage(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeypress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      sendMessage(e as any);
      e.preventDefault();
    }
  };

  return (
    <div className="relative h-screen w-full bg-black flex flex-col overflow-hidden">
      <div className="flex-1 h-[90%] overflow-auto  no-scrollbar">
        <div className="h-full dark:bg-gray-800">
          {!showEmptyChat && conversation.length > 0 ? (
            <div className="flex flex-col items-center text-sm bg-gray-800 h-full">
              {conversation.map((message, index) => (
                <Message key={index} message={message} />
              ))}
              <div ref={bottomOfChatRef}></div>
            </div>
          ) : (
            <div className="py-10 relative w-full flex flex-col h-full items-center justify-center">
              <h1 className="text-2xl sm:text-4xl font-semibold text-center text-gray-200 dark:text-gray-600">
                ChatGPT Clone
              </h1>
            </div>
          )}
        </div>
      </div>
      <div className="h-[10%] w-full border-t dark:border-white/20 bg-white dark:bg-gray-800 pt-2">
        <form
          className="stretch mx-2 flex flex-row gap-3 mb-2 lg:mx-auto lg:max-w-2xl xl:max-w-3xl"
          onSubmit={sendMessage}
        >
          <div className="relative flex flex-col h-full flex-1 items-stretch">
            {errorMessage && (
              <div className="mb-2 text-red-500 text-sm text-center">
                {errorMessage}
              </div>
            )}
            <div className="flex flex-col w-full py-2 flex-grow md:py-3 md:pl-4 relative border border-black/10 bg-white dark:border-gray-900/50 dark:text-white dark:bg-gray-700 rounded-md shadow-[0_0_10px_rgba(0,0,0,0.10)] dark:shadow-[0_0_15px_rgba(0,0,0,0.10)]">
              <textarea
                ref={textAreaRef}
                value={message}
                placeholder="Send a message..."
                className="m-0 w-full resize-none border-0 bg-transparent p-0 pr-7 focus:ring-0 focus-visible:ring-0 dark:bg-transparent pl-2 md:pl-0"
                style={{
                  height: "24px",
                  maxHeight: "200px",
                  overflowY: "hidden",
                }}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={handleKeypress}
              ></textarea>
              <button
                type="submit"
                disabled={isLoading || message.trim().length === 0}
                className="absolute p-1 rounded-md bottom-1.5 md:bottom-2.5 bg-transparent disabled:bg-gray-500 right-1 md:right-2 disabled:opacity-40"
              >
                <FiSend className="h-4 w-4 mr-1 text-white " />
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Chat;


