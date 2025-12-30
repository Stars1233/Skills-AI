const skills = [
  {
    name: "App Store Changelog",
    folder: "app-store-changelog",
    description:
      "Generate App Store release notes from git history with user-focused summaries.",
    references: [
      {
        title: "Release notes guidelines",
        file: "references/release-notes-guidelines.md",
      },
    ],
  },
  {
    name: "iOS Debugger Agent",
    folder: "ios-debugger-agent",
    description:
      "Build, run, and debug iOS apps on simulators with UI interaction and log capture.",
    references: [],
  },
  {
    name: "Swift Concurrency Expert",
    folder: "swift-concurrency-expert",
    description:
      "Review and remediate Swift 6.2+ concurrency issues with actor isolation and Sendable safety.",
    references: [
      {
        title: "Swift 6.2 concurrency",
        file: "references/swift-6-2-concurrency.md",
      },
      {
        title: "SwiftUI concurrency tour",
        file: "references/swiftui-concurrency-tour-wwdc.md",
      },
    ],
  },
  {
    name: "SwiftUI Liquid Glass",
    folder: "swiftui-liquid-glass",
    description:
      "Adopt and review Liquid Glass APIs in SwiftUI with correct usage patterns and fallbacks.",
    references: [
      {
        title: "Liquid Glass reference",
        file: "references/liquid-glass.md",
      },
    ],
  },
  {
    name: "SwiftUI View Refactor",
    folder: "swiftui-view-refactor",
    description:
      "Refactor SwiftUI views for consistent structure, dependency injection, and Observation usage.",
    references: [
      {
        title: "MV patterns",
        file: "references/mv-patterns.md",
      },
    ],
  },
  {
    name: "SwiftUI Performance Audit",
    folder: "swiftui-performance-audit",
    description:
      "Code-first review for SwiftUI performance pitfalls with targeted fixes and profiling guidance.",
    references: [
      {
        title: "Optimizing with Instruments",
        file: "references/optimizing-swiftui-performance-instruments.md",
      },
      {
        title: "Understanding SwiftUI performance",
        file: "references/understanding-improving-swiftui-performance.md",
      },
      {
        title: "Understanding hangs",
        file: "references/understanding-hangs-in-your-app.md",
      },
      {
        title: "Demystify SwiftUI performance",
        file: "references/demystify-swiftui-performance-wwdc23.md",
      },
    ],
  },
];

const repoInfo = getRepoInfo();
const githubLink = document.getElementById("githubLink");
const skillsList = document.getElementById("skillsList");
const skillTitle = document.getElementById("skillTitle");
const skillDescription = document.getElementById("skillDescription");
const skillUsage = document.getElementById("skillUsage");
const referenceBar = document.getElementById("referenceBar");
const markdownContent = document.getElementById("markdownContent");

githubLink.href = repoInfo
  ? `https://github.com/${repoInfo.owner}/${repoInfo.repo}`
  : "#";

renderSkillList();
selectSkill(skills[0]);

function renderSkillList() {
  skillsList.innerHTML = "";
  skills.forEach((skill) => {
    const item = document.createElement("button");
    item.className = "skill-item";
    item.type = "button";
    item.dataset.folder = skill.folder;

    const title = document.createElement("div");
    title.className = "skill-item__title";
    title.textContent = skill.name;

    const meta = document.createElement("div");
    meta.className = "skill-item__meta";

    const badge = document.createElement("span");
    badge.className = "skill-item__badge";
    badge.textContent = `${skill.references.length} ref${skill.references.length === 1 ? "" : "s"}`;

    const folder = document.createElement("span");
    folder.textContent = skill.folder;

    meta.append(badge, folder);

    const preview = document.createElement("div");
    preview.className = "skill-item__preview";
    preview.textContent = truncateText(skill.description, 110);

    item.append(title, meta, preview);
    item.addEventListener("click", () => selectSkill(skill));
    skillsList.append(item);
  });
}

function selectSkill(skill) {
  setActiveSkill(skill);
  skillTitle.textContent = skill.name;
  skillDescription.textContent = skill.description;
  skillUsage.textContent = "";
  renderReferenceBar(skill);
  loadMarkdown(skill, "SKILL.md");
}

function setActiveSkill(skill) {
  Array.from(skillsList.children).forEach((node) => {
    node.classList.toggle("active", node.dataset.folder === skill.folder);
  });
}

function renderReferenceBar(skill) {
  referenceBar.innerHTML = "";

  const mainButton = document.createElement("button");
  mainButton.className = "reference-pill active";
  mainButton.type = "button";
  mainButton.textContent = "SKILL.md";
  mainButton.addEventListener("click", () => {
    setActiveReference(mainButton);
    loadMarkdown(skill, "SKILL.md");
  });
  referenceBar.append(mainButton);

  if (!skill.references.length) {
    const empty = document.createElement("span");
    empty.className = "muted";
    empty.textContent = "No references";
    referenceBar.append(empty);
    return;
  }

  skill.references.forEach((ref) => {
    const refButton = document.createElement("button");
    refButton.className = "reference-pill";
    refButton.type = "button";
    refButton.textContent = ref.title;
    refButton.addEventListener("click", () => {
      setActiveReference(refButton);
      loadMarkdown(skill, ref.file);
    });
    referenceBar.append(refButton);
  });
}

function setActiveReference(activeButton) {
  Array.from(referenceBar.querySelectorAll(".reference-pill")).forEach((node) => {
    node.classList.toggle("active", node === activeButton);
  });
}

function loadMarkdown(skill, filePath) {
  const contentPath = buildContentPath(`${skill.folder}/${filePath}`);
  fetch(contentPath)
    .then((response) => {
      if (!response.ok) {
        throw new Error("Failed to load content");
      }
      return response.text();
    })
    .then((text) => {
      const parsed = parseFrontmatter(text);
      const content = stripH1(parsed.content, parsed.frontmatter.name || skill.name);
      const overview = extractOverview(content);
      updateHeader(parsed.frontmatter, overview, skill);

      if (window.marked) {
        markdownContent.innerHTML = window.marked.parse(content);
      } else {
        markdownContent.textContent = content;
      }
    })
    .catch(() => {
      markdownContent.textContent =
        "Unable to load this document. Make sure the file exists and the server can reach it.";
    });
}

function buildContentPath(path) {
  if (!repoInfo) {
    return `../${path}`;
  }
  return `https://raw.githubusercontent.com/${repoInfo.owner}/${repoInfo.repo}/main/${path}`;
}

function updateHeader(frontmatter, overview, skill) {
  if (frontmatter.name) {
    skillTitle.textContent = frontmatter.name;
  }
  if (frontmatter.description) {
    skillDescription.textContent = frontmatter.description;
  }
  if (overview) {
    skillUsage.textContent = `Usage: ${overview}`;
  } else if (skill.description) {
    skillUsage.textContent = `Usage: ${skill.description}`;
  }
}

function parseFrontmatter(text) {
  if (!text.startsWith("---")) {
    return { frontmatter: {}, content: text };
  }

  const parts = text.split("\n");
  let endIndex = -1;
  for (let i = 1; i < parts.length; i += 1) {
    if (parts[i].trim() === "---") {
      endIndex = i;
      break;
    }
  }

  if (endIndex === -1) {
    return { frontmatter: {}, content: text };
  }

  const yamlLines = parts.slice(1, endIndex);
  const content = parts.slice(endIndex + 1).join("\n");
  const frontmatter = {};

  yamlLines.forEach((line) => {
    const match = line.match(/^([a-zA-Z0-9_-]+):\s*(.*)$/);
    if (!match) return;
    const key = match[1];
    let value = match[2].trim();
    if (value.startsWith("\"") && value.endsWith("\"")) {
      value = value.slice(1, -1);
    }
    frontmatter[key] = value;
  });

  return { frontmatter, content };
}

function stripH1(content, title) {
  const lines = content.split("\n");
  if (!lines.length) return content;

  const firstLine = lines[0].trim();
  const normalizedTitle = (title || "").trim().toLowerCase();
  if (firstLine.startsWith("#")) {
    const heading = firstLine.replace(/^#+\s*/, "").trim().toLowerCase();
    if (!normalizedTitle || heading === normalizedTitle) {
      return lines.slice(1).join("\n").trimStart();
    }
  }
  return content;
}

function extractOverview(content) {
  const match = content.match(/##\s+Overview\s+([\s\S]*?)(\n##\s|$)/i);
  if (!match) return "";
  const body = match[1].trim();
  const paragraph = body.split("\n\n")[0];
  return paragraph.replace(/\s+/g, " ").trim();
}

function truncateText(text, maxLength) {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength - 1).trim()}…`;
}

function getRepoInfo() {
  const host = window.location.hostname;
  const pathParts = window.location.pathname.split("/").filter(Boolean);

  if (!host || host.indexOf(".github.io") === -1) {
    return null;
  }

  const owner = host.split(".")[0];
  const repo = pathParts[0];

  if (!owner || !repo) {
    return null;
  }

  return { owner, repo };
}
