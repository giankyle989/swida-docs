// src/plugins/remark-raw-markdown.mjs
import fs from 'node:fs';

export default function remarkRawMarkdown() {
  return (tree, file) => {
    const filePath = file.history[0];
    if (!filePath) return;
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    if (!file.data.frontMatter) {
      file.data.frontMatter = {};
    }
    file.data.frontMatter._rawMarkdown = rawContent;
  };
}
