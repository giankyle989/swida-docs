import React, {useCallback} from 'react';
import {useDoc} from '@docusaurus/plugin-content-docs/client';
import styles from './styles.module.css';

function getFilenameFromSource(source) {
  // source is like "@site/docs/swida/prd/SWIDA_PRD_EN.md"
  const parts = source.split('/');
  return parts[parts.length - 1] || 'document.md';
}

export default function DownloadButton() {
  const {metadata, frontMatter} = useDoc();
  const rawMarkdown = frontMatter._rawMarkdown;

  const handleDownload = useCallback(() => {
    if (!rawMarkdown) return;
    const blob = new Blob([rawMarkdown], {type: 'text/markdown;charset=utf-8'});
    const url = URL.createObjectURL(blob);
    const filename = getFilenameFromSource(metadata.source);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }, [rawMarkdown, metadata.source]);

  if (!rawMarkdown) return null;

  return (
    <button
      type="button"
      className={styles.downloadButton}
      onClick={handleDownload}
      title={`Download ${getFilenameFromSource(metadata.source)}`}
    >
      ⬇ Download .md
    </button>
  );
}
