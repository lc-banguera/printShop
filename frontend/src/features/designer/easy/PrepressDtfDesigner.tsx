import * as React from "react";
import { useNavigate } from "react-router-dom";
import "./prepress-dtf.css";
import prepressDtfHtml from "./prepress-dtf.html?raw";
import { initPrepressDtfEngine } from "./prepress-dtf-engine";

/**
 * Strip the outer <div class="app" id="app">…</div> wrapper from the HTML
 * fragment, since the React host div already IS that container.
 * The fragment also has siblings outside that div (#busy, #toast) which we
 * must preserve.
 *
 * Strategy: find the first <div … id="app"…> opening tag, remove it and its
 * matching closing </div> (the last </div> before #busy / #toast siblings).
 */
function stripAppWrapper(html: string): string {
  // Find the opening tag of div#app
  const openTagRe = /<div[^>]+id=["']app["'][^>]*>/i;
  const match = openTagRe.exec(html);
  if (!match) return html;

  const openStart = match.index;
  const openEnd = openStart + match[0].length;

  // We need to find the MATCHING closing </div>.
  // Walk forward counting depth.
  let depth = 1;
  let pos = openEnd;
  while (pos < html.length && depth > 0) {
    const nextOpen = html.indexOf("<div", pos);
    const nextClose = html.indexOf("</div>", pos);
    if (nextClose === -1) break;
    if (nextOpen !== -1 && nextOpen < nextClose) {
      depth++;
      pos = nextOpen + 4;
    } else {
      depth--;
      if (depth === 0) {
        // Remove opening tag and matching closing tag
        const beforeOpen = html.slice(0, openStart);
        const inner = html.slice(openEnd, nextClose);
        const afterClose = html.slice(nextClose + 6); // 6 = "</div>".length
        return beforeOpen + inner + afterClose;
      }
      pos = nextClose + 6;
    }
  }
  return html;
}

const processedHtml = stripAppWrapper(prepressDtfHtml);

export function PrepressDtfDesigner() {
  const navigate = useNavigate();
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!rootRef.current) return;
    const cleanup = initPrepressDtfEngine(rootRef.current, {
      onNavigateAdvanced: () => {
        navigate("/designerv/advanced");
      },
    });

    return () => {
      cleanup();
    };
  }, [navigate]);

  return (
    <div
      ref={rootRef}
      className="prepress-dtf-root app"
      id="app"
      dangerouslySetInnerHTML={{ __html: processedHtml }}
    />
  );
}

export default PrepressDtfDesigner;
