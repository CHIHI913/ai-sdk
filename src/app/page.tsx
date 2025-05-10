"use client";

import { useCompletion } from "@ai-sdk/react";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";

export default function Page() {
  const { completion, input, handleSubmit, handleInputChange, isLoading } =
    useCompletion({
      api: "http://localhost:3100/api/v1/gpt",
      initialInput: "",
      body: {
        system: "あなたは転職アドバイザーです。",
      },
    });

  // completionの編集用状態
  const [editableCompletion, setEditableCompletion] =
    React.useState(completion);
  React.useEffect(() => {
    setEditableCompletion(completion);
  }, [completion]);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 p-2">
        <div className="flex flex-row gap-2">
          <div className="w-24 text-zinc-500">AI:</div>
          <div className="w-full">
            <TextareaAutosize
              className="p-2 bg-zinc-100 text-black resize-none"
              style={{ width: "1000px" }}
              minRows={3}
              value={editableCompletion}
              onChange={(e) => setEditableCompletion(e.target.value)}
            />
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="fixed bottom-0 w-full p-2">
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          className="w-full p-2 bg-zinc-100 text-black"
          disabled={isLoading}
        />
      </form>
    </div>
  );
}
