(() => {
  "use strict";

  const latinText = /[A-Za-z][A-Za-z0-9+.'’/-]*(?:\s+[A-Za-z][A-Za-z0-9+.'’/-]*)*/g;
  const excludedParents = "script, style, noscript, textarea, pre, code, svg, template, .fantasy-numeral, .spoiler-lineage, .cinzel-en";

  const applyCinzelToEnglish = (root = document.body) => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
    const textNodes = [];

    while (walker.nextNode()) {
      const node = walker.currentNode;
      if (!node.nodeValue || !/[A-Za-z]/.test(node.nodeValue)) continue;
      if (node.parentElement?.closest(excludedParents)) continue;
      textNodes.push(node);
    }

    textNodes.forEach((node) => {
      const text = node.nodeValue;
      const matches = [...text.matchAll(latinText)];
      if (!matches.length) return;

      const fragment = document.createDocumentFragment();
      let cursor = 0;

      matches.forEach((match) => {
        if (match.index > cursor) fragment.append(text.slice(cursor, match.index));

        const span = document.createElement("span");
        span.className = "cinzel-en";
        span.lang = "en";
        span.textContent = match[0];
        fragment.append(span);
        cursor = match.index + match[0].length;
      });

      if (cursor < text.length) fragment.append(text.slice(cursor));
      node.replaceWith(fragment);
    });
  };

  applyCinzelToEnglish();
})();
