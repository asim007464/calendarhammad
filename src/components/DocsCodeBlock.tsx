"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";

export function DocsCodeBlock({ code, label }: { code: string; label?: string }) {
  const [copied, setCopied] = useState(false);

  function copy() {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="docs-code-block">
      {label && <span className="docs-code-label">{label}</span>}
      <div className="docs-code-wrap">
        <pre className="docs-code no-cap">{code}</pre>
        <button type="button" className="docs-code-copy" onClick={copy} aria-label="Copy code">
          {copied ? <Check size={14} /> : <Copy size={14} />}
        </button>
      </div>
    </div>
  );
}
