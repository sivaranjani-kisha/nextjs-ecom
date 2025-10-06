"use client";

import React, { useRef, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";

// client-only import of the Editor to avoid SSR mismatch
const Editor = dynamic(
  () => import("@tinymce/tinymce-react").then((mod) => mod.Editor),
  { ssr: false }
);

const TinyEditor = ({ value, onChange }) => {
  const editorRef = useRef(null);

  // memoize init so it's not recreated each render (prevents re-init)
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
        "directionality", // add direction control
      ],
      toolbar:
        "undo redo | formatselect | bold italic underline strikethrough | " +
        "alignleft aligncenter alignright alignjustify | " +
        "bullist numlist outdent indent | removeformat | code preview | ltr rtl",
      // force left-to-right inside the editor content (overrides global CSS if any)
      directionality: "ltr",
      content_style:
        "body { font-family: Helvetica, Arial, sans-serif; font-size:14px; direction: ltr; unicode-bidi: embed; }",
      branding: false,
    }),
    []
  );

  // stable handler
  const handleEditorChange = useCallback(
    (content /*, editor*/) => {
      if (typeof onChange === "function") {
        onChange({ target: { name: "description", value: content } });
      }
    },
    [onChange]
  );

  return (
    <div className="my-4">
      <label className="block mb-2 font-semibold text-gray-700">Description</label>

      <Editor
        apiKey="3jet6jywjkwr70zpahusrbze0lmetr4boh4h6gtvmjhlewcx"
        onInit={(evt, editor) => (editorRef.current = editor)}
        // use controlled value to avoid uncontrolled re-mounts; pass empty string fallback
        value={value ?? ""}
        init={init}
        onEditorChange={handleEditorChange}
      />
    </div>
  );
};

export default TinyEditor;
