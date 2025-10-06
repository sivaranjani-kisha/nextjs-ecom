"use client";

import React, { useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

const TinyEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  const init = useMemo(
  () => ({
    height: 400,
    menubar: true,
    plugins: [
      "advlist",
      "autolink",
      "lists",
      "link",
      "image",
      "charmap",
      "preview",
      "anchor",
      "searchreplace",
      "visualblocks",
      "code",
      "fullscreen",
      "insertdatetime",
      "media",
      "table",
      "help",
      "wordcount",
      "directionality",
    ],
    toolbar:
      "undo redo | formatselect | bold italic underline strikethrough | " +
      "alignleft aligncenter alignright alignjustify | " +
      "bullist numlist outdent indent | removeformat | code preview | ltr rtl",
    directionality: "ltr",
    content_style:
      "body { font-family: Helvetica, Arial, sans-serif; font-size:14px; direction: ltr; unicode-bidi: embed; }",
    branding: false,
    readonly: false,
    inline: false,
  }),
  []
);


  const handleEditorChange = useCallback(
    (content) => {
      if (typeof onChange === "function") {
        onChange({ target: { name: "description", value: content } });
      }
    },
    [onChange]
  );

  return (
    <div className="my-4">
      <Editor
        apiKey="3jet6jywjkwr70zpahusrbze0lmetr4boh4h6gtvmjhlewcx"
        onInit={(evt, editor) => (editorRef.current = editor)}
        value={value ?? ""}
        init={init}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
};

export default TinyEditor;
