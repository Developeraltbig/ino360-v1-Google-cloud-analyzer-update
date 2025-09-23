// frontend/src/utils/formatUtils.js

/**
 * Ensures proper HTML formatting with adequate spacing for Quill editor
 * @param {string} text - The raw text to format
 * @return {string} - Properly formatted HTML with spacing
 */
export function formatForQuill(text) {
  if (!text) return "";

  // If already has HTML tags, we'll assume it's properly formatted
  if (
    text.includes("<h1") ||
    text.includes("<h2") ||
    text.includes("<h3") ||
    text.includes("<h4") ||
    text.includes("<h5") ||
    text.includes("<h6") ||
    text.includes("<p>") ||
    text.includes("<ul") ||
    text.includes("<ol")
  ) {
    return text;
  }

  // Process text line by line
  const lines = text.split("\n");
  let formattedText = "";
  let inParagraph = false;
  let previousLineWasEmpty = true; // Treat start of text as after empty line

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Skip empty lines but add a break if needed
    if (!line) {
      if (inParagraph) {
        formattedText += "</p>\n";
        inParagraph = false;
      }
      previousLineWasEmpty = true;
      continue;
    }

    // Function to determine heading level based on characteristics
    function getHeadingLevel(text, isAfterEmptyLine, isFirstLine) {
      // Title/main heading detection - first line or ALL CAPS with keywords
      if (
        (isFirstLine || text.toUpperCase() === text) &&
        /\b(TITLE|HEADING|SECTION|CHAPTER)\b/i.test(text)
      ) {
        return 1;
      }

      // Main section headings - shorter, after empty line, no end punctuation
      if (isAfterEmptyLine && text.length < 40 && !text.match(/[.,;:!?]$/)) {
        // Look for subsection indicators
        if (/^[0-9]+\.[0-9]+/.test(text)) {
          // Like "1.2 Something"
          return 3;
        } else if (/^[0-9]+\./.test(text)) {
          // Like "1. Something"
          return 2;
        } else if (/^[A-Z][a-z]/.test(text) && text.length < 30) {
          // Title Case
          return 2;
        } else {
          return 2; // Default for section headings
        }
      }

      // Subsection detection - after empty line, specific formats
      if (isAfterEmptyLine && !text.match(/[.,;:!?]$/)) {
        if (/^[A-Za-z]\.\s/.test(text)) {
          // Like "A. Something"
          return 3;
        } else if (/^[0-9]+\)/.test(text)) {
          // Like "1) Something"
          return 4;
        } else if (/^[a-z]\)/.test(text)) {
          // Like "a) Something"
          return 5;
        } else if (text.length < 50) {
          // Short line after empty line
          return 3;
        }
      }

      // Not a heading
      return 0;
    }

    // Check if this line might be a heading
    const headingLevel = getHeadingLevel(line, previousLineWasEmpty, i === 0);

    if (headingLevel > 0) {
      if (inParagraph) {
        formattedText += "</p>\n";
        inParagraph = false;
      }
      formattedText += `<h${headingLevel}>${line}</h${headingLevel}>\n`;
    }
    // Detect list items
    else if (
      line.match(/^[\-•*]/) ||
      line.match(/^[0-9]+\.\s/) ||
      line.match(/^[a-z]\)\s/)
    ) {
      if (inParagraph) {
        formattedText += "</p>\n";
        inParagraph = false;
      }

      // Determine if it's the start of a list or just a single list item
      if (
        i < lines.length - 1 &&
        (lines[i + 1].trim().match(/^[\-•*]/) ||
          lines[i + 1].trim().match(/^[0-9]+\.\s/) ||
          lines[i + 1].trim().match(/^[a-z]\)\s/))
      ) {
        // This is part of a list - start <ul> if needed
        if (!formattedText.endsWith("<ul>\n")) {
          formattedText += "<ul>\n";
        }
        formattedText += `<li>${line.replace(/^[\-•*]\s*/, "")}</li>\n`;

        // If the next line is not a list item, close the list
        if (
          i === lines.length - 1 ||
          !(
            lines[i + 1].trim().match(/^[\-•*]/) ||
            lines[i + 1].trim().match(/^[0-9]+\.\s/) ||
            lines[i + 1].trim().match(/^[a-z]\)\s/)
          )
        ) {
          formattedText += "</ul>\n";
        }
      } else {
        // Just format as a paragraph since it's a single item
        formattedText += `<p>${line}</p>\n`;
      }
    }
    // Detect labeled content (with colons)
    else if (line.includes(":")) {
      if (inParagraph) {
        formattedText += "</p>\n";
        inParagraph = false;
      }

      // Split at the colon
      const [label, content] = line.split(/:(.+)/);

      // If it's just a label with minimal content, make it bold in a paragraph
      if (content && content.trim().length < 50) {
        formattedText += `<p><strong>${label.trim()}:</strong> ${content.trim()}</p>\n`;
      } else {
        // Otherwise, treat as a normal paragraph
        formattedText += `<p>${line}</p>\n`;
      }
    }
    // Standard paragraph text
    else {
      if (!inParagraph) {
        formattedText += "<p>";
        inParagraph = true;
      }

      formattedText += line + " ";

      // Close paragraph if next line is empty or this is the last line
      if (i === lines.length - 1 || !lines[i + 1].trim()) {
        formattedText += "</p>\n";
        inParagraph = false;
      }
    }

    previousLineWasEmpty = false;
  }

  // Close any open paragraph
  if (inParagraph) {
    formattedText += "</p>\n";
  }

  return formattedText;
}
