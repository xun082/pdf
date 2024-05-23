"use client";

import { useRef, useEffect, Fragment, FC, ReactNode } from "react";
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { enqueueSnackbar } from "notistack";
import { Plugin, PluginKey } from "prosemirror-state";
import { Extension, Editor } from "@tiptap/core";
import { useEditor } from "@tiptap/react";
import { RichTextEditorProvider, RichTextField } from "mui-tiptap";
import { mutate } from "swr";
import {
  TemplateEditorExtensions,
  TemplateEditorMenuControls,
} from "@/components/tiptap";
import {
  MarkdownSerializer,
  defaultMarkdownSerializer,
} from "prosemirror-markdown";

// import axios, { endpoints } from "src/utils/axios";

interface ScrollableStackProps {
  children: ReactNode;
}

const ScrollableStack: FC<ScrollableStackProps> = ({ children }) => {
  return (
    <div className="overflow-scroll flex-grow no-scrollbar">{children}</div>
  );
};

export default function EditAgentReadMe() {
  const editorRef = useRef<Editor | null>(null);
  const extensions = TemplateEditorExtensions({
    placeholder: "请输入模版内容...",
  });

  const PasteImageHandler = Extension.create({
    name: "pasteImageHandler",

    addProseMirrorPlugins() {
      return [
        new Plugin({
          key: new PluginKey("handlePaste"),
          props: {
            handlePaste: (view, event: any, slice) => {
              const items = (
                event.clipboardData || event.originalEvent.clipboardData
              ).items;

              for (const item of items) {
                if (item.type.indexOf("image") === 0) {
                  event.preventDefault();

                  const file = item.getAsFile();
                  if (file) {
                    // uploadImage(file, editorRef.current);
                  }

                  return true;
                }
              }

              return false;
            },
          },
        }),
      ];
    },
  });

  const editor = useEditor({
    extensions: [PasteImageHandler, ...extensions],
    content: "",
  });

  // async function uploadImage(file, editor) {
  //   // 实现文件上传到服务器的逻辑，下面是一个示例逻辑
  //   const formData = new FormData();
  //   formData.append("files", file);

  //   const data = await axios.post(endpoints.storage.image, formData);

  //   const imageInfo = data.data.data;

  //   const imageId = imageInfo.success_files[0].image_id;

  //   editor.commands.setImage({
  //     src: endpoints.image.normal(imageId),
  //   });
  // }

  // const changeDescription = async () => {
  //   const jsonContent = editor.getJSON();
  //   await axios.put(endpoints.agent.agent(agentId), {
  //     readme: JSON.stringify(jsonContent || {}),
  //   });
  //   await mutate(endpoints.agent.profile(agentId));
  //   enqueueSnackbar("修改成功");
  //   close();
  // };

  const exportMarkdown = () => {
    if (!editor) return;

    const doc = editor.state.doc;
    const content = defaultMarkdownSerializer.serialize(doc);

    const blob = new Blob([content], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "document.md";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  useEffect(() => {
    editorRef.current = editor;
  }, [editor]);

  return (
    <Fragment>
      <Stack height={1} direction={"column"} sx={{ px: 1 }}>
        <RichTextEditorProvider editor={editor}>
          <Stack>
            <TemplateEditorMenuControls />
            <button
              onClick={exportMarkdown}
              className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
            >
              Export as Markdown
            </button>
          </Stack>
          <Divider />
          <ScrollableStack>
            <RichTextField variant={"standard"} />
          </ScrollableStack>
        </RichTextEditorProvider>
      </Stack>
    </Fragment>
  );
}
