// src/utils/plantUmlRenderer.js
import pako from 'pako';

// Enhanced extractPlantUmlContent function
export const extractPlantUmlContent = (content) => {
  if (!content || content.trim() === "") return "";
  
  console.log("Extracting PlantUML from raw content:", 
    content.length > 100 ? content.substring(0, 100) + '...' : content);
  
  // Extract content between @startuml and @enduml with improved regex
  const plantUmlRegex = /@startuml([\s\S]*?)@enduml/i;
  const match = content.match(plantUmlRegex);
  
  if (match) {
    // Get the raw matched content
    let extracted = `@startuml${match[1]}@enduml`;
    
    // Clean up HTML tags and entities
    extracted = extracted
      .replace(/<[^>]+>/g, "\n")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&quot;/g, "\"")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&");
      
    // Pre-cleaning fixes for common issues
    extracted = extracted
      .replace(/@startuml\s+/, "@startuml\n")
      .replace(/\s+@enduml/, "\n@enduml")
      .replace(/(\w+)@enduml/g, "$1\n@enduml")
      .replace(/\r\n|\r/g, "\n")
      .replace(/\n\s*\n\s*\n/g, "\n\n")
      .replace(/@startuml\s*start/, "@startuml\nstart")
      .replace(/start\s+(if|:|while|repeat|then|else)/, "start\n$1")
      .replace(/[–—]/g, "-")
      .replace(/[""]/g, "\"")
      .replace(/['']/g, "'")
      .replace(/…/g, "...");
    
    console.log("Extracted and pre-cleaned PlantUML code:", extracted);
    
    // Apply deep cleaning
    const deepCleaned = deepCleanPlantUml(extracted);
    
    // Final validation and emergency fixes
    return applyEmergencyFixes(deepCleaned);
  }
  
  console.log("No PlantUML content found between @startuml/@enduml tags");
  return "";
};

// Completely rewritten deepCleanPlantUml function
function deepCleanPlantUml(raw) {
  if (!raw || raw.trim() === "") return "";

  /* ── 1. Extract header/footer and body ───────────────────────── */
  const header = (raw.match(/^\s*@startuml[^\n]*/im) || ["@startuml"])[0].trim();
  const footer = (raw.match(/^\s*@enduml[^\n]*/im) || ["@enduml"])[0].trim();

  let body = raw
    .replace(/^\s*@startuml[^\n]*/im, "")
    .replace(/^\s*@enduml[^\n]*/im, "")
    .replace(/\r\n|\r/g, "\n")
    .trim();

  /* ── 2. Detect diagram type ─────────────────────────────────── */
  const isActivityDiagram = /:Step\s+\d+/i.test(body);
  const isComponentDiagram = /\[.*?\]|component\s+/i.test(body) && !isActivityDiagram;

  /* ── 3. Apply diagram-specific cleaning ─────────────────────── */
  if (isComponentDiagram) {
    body = cleanComponentDiagramRobust(body);
  } else if (isActivityDiagram) {
    body = cleanActivityDiagramRobust(body);
  }

  /* ── 4. Final assembly ──────────────────────────────────────── */
  body = body.replace(/\n{3,}/g, "\n\n").trim();
  return `${header}\n${body}\n${footer}`;
}

// Robust component diagram cleaning - ENHANCED VERSION
function cleanComponentDiagramRobust(body) {
  console.log("Applying robust component diagram cleaning");
  
  // Step 1: Remove only truly problematic elements (keep interfaces!)
  body = removeProblematicElements(body);
  
  // Step 2: Extract components AND interfaces
  const { components, interfaces } = extractComponentsAndInterfaces(body);
  
  // Step 3: Extract ALL relationships including interface connections
  const relationships = extractAndCleanRelationships(body, components, interfaces);
  
  // Step 4: Rebuild diagram with interfaces preserved
  return rebuildComponentDiagramWithProperFormatting(components, interfaces, relationships);
}

// Remove problematic syntax elements - UPDATED
function removeProblematicElements(body) {
  return body
    // Remove stray braces (but not in component definitions)
    .replace(/^\s*\}\s*$/gm, "")
    
    // Remove layout directives
    .replace(/^\s*(left to right direction|top to bottom direction)\s*$/gm, "")
    .replace(/^\s*skinparam\s+.*$/gm, "")
    
    // Clean up package remnants but preserve the content
    .replace(/package\s+"[^"]*"\s*\{([^}]*)\}/gi, "$1")
    .replace(/package\s+\w+\s*\{([^}]*)\}/gi, "$1");
}

// NEW FUNCTION: Extract both components and interfaces
function extractComponentsAndInterfaces(body) {
  const componentSet = new Set();
  const interfaceMap = new Map(); // Map to store interface name -> alias
  
  // Extract regular components
  const componentRegex = /(?<!interface\s+["']?.*["']?\s+as\s*)\[([^\]]+)\]/g;
  let match;
  
  while ((match = componentRegex.exec(body)) !== null) {
    let componentName = cleanComponentName(match[1].trim());
    if (componentName && componentName.length > 0) {
      componentSet.add(componentName);
    }
  }
  
  // Extract interfaces with format: interface "Name" as Alias
  const interfaceRegex1 = /interface\s+["']([^"']+)["']\s+as\s+(\w+)/gi;
  while ((match = interfaceRegex1.exec(body)) !== null) {
    interfaceMap.set(match[2], match[1]); // alias -> name
  }
  
  // Extract interfaces with format: interface Alias
  const interfaceRegex2 = /interface\s+(\w+)(?!\s+as)/gi;
  while ((match = interfaceRegex2.exec(body)) !== null) {
    interfaceMap.set(match[1], match[1]); // alias -> name (same)
  }
  
  // Extract interfaces with format: () "Name" as Alias
  const interfaceRegex3 = /\(\)\s+["']([^"']+)["']\s+as\s+(\w+)/gi;
  while ((match = interfaceRegex3.exec(body)) !== null) {
    interfaceMap.set(match[2], match[1]); // alias -> name
  }
  
  // Extract interfaces with format: () Alias
  const interfaceRegex4 = /\(\)\s+(\w+)(?!\s+as)/gi;
  while ((match = interfaceRegex4.exec(body)) !== null) {
    interfaceMap.set(match[1], match[1]); // alias -> name (same)
  }
  
  return {
    components: Array.from(componentSet),
    interfaces: interfaceMap
  };
}

// Clean individual component names
function cleanComponentName(name) {
  return name
    // Fix spacing around numbers
    .replace(/\s+(\d+)\s*/g, " $1")
    
    // Remove extra whitespace
    .replace(/\s+/g, " ")
    .trim()
    
    // Remove problematic characters
    .replace(/[(){}]/g, "")
    
    // Ensure it's not empty after cleaning
    .replace(/^\s*$/, "");
}

// ENHANCED: Extract relationships including interfaces and directional arrows
function extractAndCleanRelationships(body, validComponents, interfaces) {
  const relationships = [];
  
  // First, split concatenated relationships
  const concatenatedPattern = /(\[[^\]]+\]\s*-+[->]+\s*\[[^\]]+\](?:\s*:\s*[^|\[\n]+)?)\s+(\[[^\]]+\]\s*-+[->]+\s*\[[^\]]+\])/g;
  body = body.replace(concatenatedPattern, (match, rel1, rel2) => {
    return rel1 + '\n' + rel2;
  });
  
  // Enhanced pattern to match various relationship types including directional
  const relationshipPatterns = [
    // Component to Component (with directional arrows)
    /\[([^\]]+)\]\s*((?:-+(?:up|down|left|right)?-*[->]+)|(?:\.+(?:up|down|left|right)?\.+>)|(?:<-+)|(?:--+))\s*\[([^\]]+)\](?:\s*:\s*([^|\[\n]+))?/g,
    
    // Interface to Component
    /(\w+)\s*((?:-+(?:up|down|left|right)?-*[->]+)|(?:\.+(?:up|down|left|right)?\.+>)|(?:--+))\s*\[([^\]]+)\](?:\s*:\s*([^|\[\n]+))?/g,
    
    // Component to Interface
    /\[([^\]]+)\]\s*((?:-+(?:up|down|left|right)?-*[->]+)|(?:\.+(?:up|down|left|right)?\.+>)|(?:--+))\s*(\w+)(?:\s*:\s*([^|\[\n]+))?/g,
  ];
  
  relationshipPatterns.forEach((pattern, patternIndex) => {
    let match;
    pattern.lastIndex = 0; // Reset regex
    
    while ((match = pattern.exec(body)) !== null) {
      let source, target, arrow, label;
      
      if (patternIndex === 0) { // Component to Component
        source = cleanComponentName(match[1]);
        arrow = match[2];
        target = cleanComponentName(match[3]);
        label = match[4];
        
        if (validComponents.includes(source) && validComponents.includes(target)) {
          relationships.push({
            source,
            target,
            arrow: normalizeArrowEnhanced(arrow),
            label: label ? label.trim() : null,
            sourceType: 'component',
            targetType: 'component'
          });
        }
      } else if (patternIndex === 1) { // Interface to Component
        source = match[1];
        arrow = match[2];
        target = cleanComponentName(match[3]);
        label = match[4];
        
        if (interfaces.has(source) && validComponents.includes(target)) {
          relationships.push({
            source,
            target,
            arrow: normalizeArrowEnhanced(arrow),
            label: label ? label.trim() : null,
            sourceType: 'interface',
            targetType: 'component'
          });
        }
      } else if (patternIndex === 2) { // Component to Interface
        source = cleanComponentName(match[1]);
        arrow = match[2];
        target = match[3];
        label = match[4];
        
        if (validComponents.includes(source) && interfaces.has(target)) {
          relationships.push({
            source,
            target,
            arrow: normalizeArrowEnhanced(arrow),
            label: label ? label.trim() : null,
            sourceType: 'component',
            targetType: 'interface'
          });
        }
      }
    }
  });
  
  // Remove duplicates
  return deduplicateRelationships(relationships);
}

// ENHANCED: Normalize arrows preserving directional information
function normalizeArrowEnhanced(arrow) {
  // Preserve directional arrows
  if (arrow.includes("-up->")) return "-up->";
  if (arrow.includes("-down->")) return "-down->";
  if (arrow.includes("-left->")) return "-left->";
  if (arrow.includes("-right->")) return "-right->";
  if (arrow.includes(".up.>")) return ".up.>";
  if (arrow.includes(".down.>")) return ".down.>";
  if (arrow.includes(".left.>")) return ".left.>";
  if (arrow.includes(".right.>")) return ".right.>";
  
  // Standard arrows
  if (arrow.includes("<-")) return "<--";
  if (arrow.includes("..>")) return "..>";
  if (arrow.includes("-->")) return "-->";
  if (arrow.includes("--")) return "--";
  
  return "-->";
}

// Remove duplicate relationships
function deduplicateRelationships(relationships) {
  const seen = new Set();
  return relationships.filter(rel => {
    const key = `${rel.source}-${rel.arrow}-${rel.target}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

// ENHANCED: Rebuild diagram with interfaces and better formatting
function rebuildComponentDiagramWithProperFormatting(components, interfaces, relationships) {
  let result = "";
  
  // Add interface declarations
  interfaces.forEach((name, alias) => {
    if (name === alias) {
      result += `interface ${alias}\n`;
    } else {
      result += `interface "${name}" as ${alias}\n`;
    }
  });
  
  if (interfaces.size > 0 && components.length > 0) {
    result += "\n";
  }
  
  // Add component declarations
  components.forEach(comp => {
    result += `[${comp}]\n`;
  });
  
  if (relationships.length > 0) {
    result += "\n";
    
    // Add relationships with proper formatting
    relationships.forEach(rel => {
      let sourceName = rel.source;
      let targetName = rel.target;
      
      // Format based on node types
      if (rel.sourceType === 'component') sourceName = `[${sourceName}]`;
      if (rel.targetType === 'component') targetName = `[${targetName}]`;
      
      if (rel.label) {
        result += `${sourceName} ${rel.arrow} ${targetName} : ${rel.label}\n`;
      } else {
        result += `${sourceName} ${rel.arrow} ${targetName}\n`;
      }
    });
  } else if (components.length > 1) {
    // Add minimal relationships if none exist
    result += "\n";
    result += generateSmartConnections(components);
  }
  
  return result.trim();
}

// Generate smart connections for components when no relationships exist
function generateSmartConnections(components) {
  let connections = "";
  
  if (components.length === 2) {
    // Simple connection for 2 components
    connections += `[${components[0]}] --> [${components[1]}]\n`;
  } else if (components.length <= 5) {
    // Chain connection for small number of components
    for (let i = 0; i < components.length - 1; i++) {
      connections += `[${components[i]}] --> [${components[i + 1]}]\n`;
    }
  } else {
    // For larger diagrams, connect first component to others (hub pattern)
    const hub = components[0];
    for (let i = 1; i < Math.min(components.length, 4); i++) {
      connections += `[${hub}] --> [${components[i]}]\n`;
    }
  }
  
  return connections;
}

// Robust activity diagram cleaning (simplified)
function cleanActivityDiagramRobust(body) {
  // Ensure proper step formatting
  body = body.replace(/\s+:Step/gi, "\n:Step");
  
  // Ensure semicolons on actions
  body = body.replace(/:([^:\n]+?)(?=\n|$)/g, (_m, txt) => {
    const t = txt.trimEnd();
    return t.endsWith(";") ? `:${t}` : `:${t};`;
  });
  
  // Fix control keywords
  body = body.replace(/;\s*(if|else|endif|repeat|break|continue)\b/gi, ";\n$1");
  
  // Ensure start/stop keywords are on their own lines
  const controlKeywords = ['start', 'stop', 'else', 'endif', 'repeat', 'endwhile'];
  controlKeywords.forEach(keyword => {
    body = body.replace(new RegExp(`\\s*\\b${keyword}\\b`, "gi"), `\n${keyword}`);
  });
  
  return body;
}

// Check if diagram is already well-formed
function isWellFormedDiagram(content) {
  const hasComponents = /\[([^\]]+)\]/.test(content);
  const hasRelationships = /-+[->]+|<-+/.test(content);
  const isActivity = /:Step\s+\d+/i.test(content);
  
  // Activity diagrams don't need relationships
  if (isActivity) return true;
  
  // Component diagrams should have relationships if they have multiple components
  const componentCount = (content.match(/\[([^\]]+)\]/g) || []).length;
  return !hasComponents || componentCount <= 1 || hasRelationships;
}

// Enhanced emergency fixes
function applyEmergencyFixes(content) {
  // Don't apply emergency fixes if content is already well-formed
  if (isWellFormedDiagram(content)) {
    return content;
  }
  
  let fixed = content;
  
  // CRITICAL FIX: Split concatenated relationships before adding emergency fixes
  fixed = splitConcatenatedRelationships(fixed);
  
  // Only add relationships if there are absolutely none and we have valid components
  const hasComponents = /\[([^\]]+)\]/.test(fixed);
  const hasRelationships = /-+[->]+|<-+/.test(fixed);
  
  if (hasComponents && !hasRelationships) {
    const components = Array.from(new Set(
      (fixed.match(/\[([^\]]+)\]/g) || [])
        .map(comp => comp.replace(/[\[\]]/g, "").trim())
        .filter(name => name.length > 0 && !/^\s*\d*\s*$/.test(name))
    ));
    
    if (components.length === 2) {
      // For exactly 2 components, add one simple relationship
      fixed = fixed.replace(/@enduml/, `\n\n[${components[0]}] --> [${components[1]}]\n@enduml`);
    } else if (components.length > 2 && components.length <= 4) {
      // For 3-4 components, add a simple chain
      let relationships = "\n\n";
      for (let i = 0; i < components.length - 1; i++) {
        relationships += `[${components[i]}] --> [${components[i + 1]}]\n`;
      }
      fixed = fixed.replace(/@enduml/, relationships + "@enduml");
    }
  }
  
  return fixed;
}

// CRITICAL NEW FUNCTION: Split concatenated relationships
function splitConcatenatedRelationships(content) {
  // Pattern to find relationships that are concatenated on the same line
  const concatenatedPattern = /(\[[^\]]+\]\s*-+[->]+\s*\[[^\]]+\](?:\s*:\s*[^|\[\n]+)?)\s+(\[[^\]]+\]\s*-+[->]+\s*\[[^\]]+\])/g;
  
  let result = content;
  let hasChanges = true;
  
  // Keep splitting until no more concatenations are found
  while (hasChanges) {
    const before = result;
    result = result.replace(concatenatedPattern, (match, rel1, rel2) => {
      return rel1 + '\n' + rel2;
    });
    hasChanges = (result !== before);
  }
  
  return result;
}

// Updated encodePlantUml function according to PlantUML documentation
export const encodePlantUml = (plantUmlCode) => {
  if (!plantUmlCode || plantUmlCode.trim() === "") return null;

  try {
    // Clean and format the PlantUML code
    let formattedCode = plantUmlCode
      .replace(/<[^>]+>/g, "\n")
      .replace(/&gt;/g, ">")
      .replace(/&lt;/g, "<")
      .replace(/&quot;/g, "\"")
      .replace(/&apos;/g, "'")
      .replace(/&amp;/g, "&")
      .trim();

    // Make sure the @startuml and @enduml tags are on their own lines
    formattedCode = formattedCode
      .replace(/@startuml\s+/, "@startuml\n")
      .replace(/\s+@enduml/, "\n@enduml");
    
    console.log("Encoding PlantUML code:", formattedCode);
    
    // Use TextEncoder for UTF-8 encoding
    const textEncoder = new TextEncoder();
    const bytes = textEncoder.encode(formattedCode);
    
    // Use pako for Deflate compression
   const deflated = pako.deflateRaw(bytes, { level: 9 });
    
    // Convert to base64
    const base64 = btoa(String.fromCharCode.apply(null, deflated));
    
    // Convert from standard base64 to PlantUML encoding
    // Standard: ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/
    // PlantUML: 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_
    const standard = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/";
    const plantuml = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz-_";
    
    let plantUmlEncoded = "";
    for (let i = 0; i < base64.length; i++) {
      const char = base64.charAt(i);
      if (char === '=') continue; // Skip padding
      
      const index = standard.indexOf(char);
      plantUmlEncoded += (index >= 0) ? plantuml.charAt(index) : char;
    }
    
    return plantUmlEncoded;
  } catch (error) {
    console.error("Error encoding PlantUML:", error);
    return null;
  }
};

// Function to generate PlantUML diagram URL
export const getPlantUmlImageUrl = (plantUmlCode, format = 'svg') => {
  try {
    const encoded = encodePlantUml(plantUmlCode);
    if (!encoded) return null;
    
    // Use the official PlantUML server
    return `https://www.plantuml.com/plantuml/${format}/${encoded}`;
  } catch (error) {
    console.error("Failed to get PlantUML image URL:", error);
    return null;
  }
};

// Function to convert PlantUML diagram to image for saving
export const plantUmlToImage = async (plantUmlCode) => {
  try {
    if (!plantUmlCode || plantUmlCode.trim() === "") return null;
    
    const url = getPlantUmlImageUrl(plantUmlCode, 'png');
    if (!url) return null;
    
    // Fetch the PNG image
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch diagram: ${response.status}`);
    }
    
    // Convert to blob and then to base64
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Remove the data URL prefix to get just the base64 data
        const base64data = reader.result.split(',')[1];
        resolve(base64data);
      };
      reader.readAsDataURL(blob);
    });
  } catch (error) {
    console.error("Error converting PlantUML to image:", error);
    return null;
  }
};