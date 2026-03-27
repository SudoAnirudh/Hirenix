import DOMPurify from "isomorphic-dompurify";

export function sanitize(html: string): string {
  // Use default DOMPurify behavior which is safe for most HTML5/SVG
  // but explicitly ensure inline styles are preserved for the resume generator
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ["style", "class", "target"],
  });
}
