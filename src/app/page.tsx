"use client";

import { useCompletion } from "@ai-sdk/react";
import { experimental_useObject as useObject } from "@ai-sdk/react";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";
import { z } from "zod";

// オプションの型定義
interface OptionData {
  options?: (string | undefined)[];
}

export default function Page() {
  const {
    completion,
    input,
    handleSubmit,
    handleInputChange,
    isLoading,
    setInput,
  } = useCompletion({
    api: "http://localhost:3100/api/v1/gpt",
    initialInput: "",
    streamProtocol: "text",
  });

  // completionの編集用状態
  const [editableCompletion, setEditableCompletion] =
    React.useState(completion);
  React.useEffect(() => {
    setEditableCompletion(completion);
  }, [completion]);

  // オプション入力用の状態
  const [optionInput, setOptionInput] = React.useState("");

  // useObjectでAPIと連携
  const {
    object,
    submit: handleOptionSubmit,
    isLoading: optionLoading,
  } = useObject<OptionData>({
    api: "http://localhost:3100/api/v1/gpt/option",
    schema: z.object({
      options: z.array(z.string().optional()),
    }),
  });

  // チップとして表示するオプション（ストリーミング中のデータをそのまま使用）
  const chipCandidates =
    object?.options?.filter((opt): opt is string => Boolean(opt)) || [];

  // チップクリック時のハンドラ
  const handleChipClick = (candidate: string) => {
    setInput(candidate);
  };

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
        {/* チップUI */}
        <div className="flex gap-2 mb-2">
          {chipCandidates.map((candidate) => (
            <button
              key={candidate}
              type="button"
              className={`px-3 py-1 rounded-full ${
                optionLoading
                  ? "bg-blue-100 text-blue-700 animate-pulse"
                  : "bg-zinc-200 text-zinc-700 hover:bg-zinc-300"
              } border border-zinc-300 transition`}
              onClick={() => handleChipClick(candidate)}
            >
              {candidate}
            </button>
          ))}
        </div>
        <input
          value={input}
          placeholder="Send message..."
          onChange={handleInputChange}
          className="w-full p-2 bg-zinc-100 text-black"
          disabled={isLoading}
        />
      </form>
      {/* オプション取得用フォーム */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleOptionSubmit({ prompt: optionInput });
        }}
        style={{ margin: "16px 0" }}
      >
        <div className="flex gap-2 items-center">
          <input
            value={optionInput}
            placeholder="オプションを入力..."
            onChange={(e) => setOptionInput(e.target.value)}
            className="p-2 bg-zinc-100 text-black"
            disabled={optionLoading}
          />
          <button
            type="submit"
            disabled={optionLoading}
            className="px-3 py-1 rounded bg-zinc-200 text-zinc-700 hover:bg-zinc-300 border border-zinc-300 transition"
          >
            オプションを取得
          </button>
        </div>
      </form>
    </div>
  );
}
