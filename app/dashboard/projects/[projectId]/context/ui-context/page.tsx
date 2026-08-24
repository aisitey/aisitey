"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, Plus, X, Download, Loader2, Save } from "lucide-react";

type ColorItem = {
  role: string;
  cssVariable: string;
  hexValue: string;
};

type TypographyItem = {
  role: string;
  font: string;
  cssVariable: string;
};

type RadiusItem = {
  context: string;
  value: string;
};

type LayoutPattern = {
  name: string;
  rules: string[];
};

type IconSize = {
  context: string;
  size: string;
};

type UIContextDocument = {
  id: string;
  project_id: string;
  file_name: string;
  content: string;
  created_at: string;
  updated_at: string;
};

export default function UIContextPage() {
  const router = useRouter();
  const { projectId } = useParams<{ projectId: string }>();

  const [theme, setTheme] = useState("");
  const [themeAvoid, setThemeAvoid] = useState("");

  const [colors, setColors] = useState<ColorItem[]>([
    { role: "", cssVariable: "", hexValue: "" },
  ]);

  const [typography, setTypography] = useState<TypographyItem[]>([
    { role: "", font: "", cssVariable: "" },
  ]);

  const [typographyNote, setTypographyNote] = useState("");

  const [radii, setRadii] = useState<RadiusItem[]>([
    { context: "", value: "" },
  ]);

  const [componentLibrary, setComponentLibrary] = useState("");
  const [componentPath, setComponentPath] = useState("");
  const [componentRule, setComponentRule] = useState("");

  const [layoutPatterns, setLayoutPatterns] = useState<LayoutPattern[]>([
    { name: "", rules: [""] },
  ]);

  const [buttonRules, setButtonRules] = useState<string[]>([""]);

  const [iconLibrary, setIconLibrary] = useState("");
  const [iconStyle, setIconStyle] = useState("");
  const [iconSizes, setIconSizes] = useState<IconSize[]>([
    { context: "", size: "" },
  ]);

  const [motionUse, setMotionUse] = useState<string[]>([""]);
  const [motionAvoid, setMotionAvoid] = useState<string[]>([""]);

  const [accessibilityRules, setAccessibilityRules] = useState<string[]>([
    "",
  ]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [hasDocument, setHasDocument] = useState(false);

  const parseMarkdown = (content: string) => {
    const lines = content.split("\n");

    const getSection = (heading: string) => {
      const startIndex = lines.findIndex(
        (line) => line.trim() === heading,
      );

      if (startIndex === -1) return [];

      const result: string[] = [];

      for (let i = startIndex + 1; i < lines.length; i++) {
        const line = lines[i];

        if (line.startsWith("## ")) break;

        result.push(line);
      }

      return result;
    };

    const cleanLines = (sectionLines: string[]) =>
      sectionLines
        .map((line) => line.trim())
        .filter(Boolean)
        .filter((line) => line !== "Not specified");

    const stripBullet = (line: string) =>
      line.replace(/^-\s*/, "").trim();

    const themeSection = getSection("## Theme");
    const themeLines = cleanLines(themeSection);

    if (themeLines.length > 0) {
      setTheme(themeLines[0]);
      setThemeAvoid(
        themeLines.find((line) => line.toLowerCase().includes("avoid")) || "",
      );
    }

    const colorsSection = getSection("## Colors");
    const parsedColors: ColorItem[] = [];

    for (const line of colorsSection) {
      const match = line.match(
        /^\|\s*([^|]+)\s*\|\s*`([^`]+)`\s*\|\s*`([^`]+)`\s*\|$/,
      );

      if (match && !match[1].includes("---") && match[1].trim() !== "Role") {
        parsedColors.push({
          role: match[1].trim(),
          cssVariable: match[2].trim(),
          hexValue: match[3].trim(),
        });
      }
    }

    if (parsedColors.length > 0) setColors(parsedColors);

    const typographySection = getSection("## Typography");
    const parsedTypography: TypographyItem[] = [];

    for (const line of typographySection) {
      const match = line.match(
        /^\|\s*([^|]+)\s*\|\s*([^|]+)\s*\|\s*`([^`]+)`\s*\|$/,
      );

      if (
        match &&
        !match[1].includes("---") &&
        match[1].trim() !== "Role"
      ) {
        parsedTypography.push({
          role: match[1].trim(),
          font: match[2].trim(),
          cssVariable: match[3].trim(),
        });
      }
    }

    if (parsedTypography.length > 0) setTypography(parsedTypography);

    const radiusSection = getSection("## Border Radius");
    const parsedRadii: RadiusItem[] = [];

    for (const line of radiusSection) {
      const match = line.match(
        /^\|\s*([^|]+)\s*\|\s*`([^`]+)`\s*\|$/,
      );

      if (
        match &&
        !match[1].includes("---") &&
        match[1].trim() !== "Context"
      ) {
        parsedRadii.push({
          context: match[1].trim(),
          value: match[2].trim(),
        });
      }
    }

    if (parsedRadii.length > 0) setRadii(parsedRadii);

    const componentSection = getSection("## Component Library");
    const componentLines = cleanLines(componentSection);

    if (componentLines.length > 0) {
      setComponentLibrary(componentLines[0]);
      setComponentPath(
        componentLines.find((line) => line.includes("Components live in")) ||
          "",
      );
      setComponentRule(
        componentLines.find(
          (line) =>
            !line.includes("Components live in") &&
            !line.includes("shadcn") &&
            !line.includes("Tailwind"),
        ) || "",
      );
    }

    const layoutSection = getSection("## Layout Patterns");
    const parsedLayouts: LayoutPattern[] = [];
    let currentLayout: LayoutPattern | null = null;

    for (const rawLine of layoutSection) {
      const line = rawLine.trim();

      if (!line) continue;

      if (line.startsWith("### ")) {
        if (currentLayout) {
          parsedLayouts.push(currentLayout);
        }

        currentLayout = {
          name: line.replace(/^###\s*/, "").trim(),
          rules: [],
        };
        continue;
      }

      if (line.startsWith("- ") && currentLayout) {
        currentLayout.rules.push(stripBullet(line));
      }
    }

    if (currentLayout) {
      parsedLayouts.push(currentLayout);
    }

    if (parsedLayouts.length > 0) setLayoutPatterns(parsedLayouts);

    const buttonsSection = getSection("## Buttons and Actions");
    const parsedButtonRules = cleanLines(buttonsSection)
      .map(stripBullet)
      .filter(Boolean);

    if (parsedButtonRules.length > 0) setButtonRules(parsedButtonRules);

    const iconsSection = getSection("## Icons");
    const iconLines = cleanLines(iconsSection);

    if (iconLines.length > 0) {
      const iconDesc = iconLines[0];
      const iconParts = iconDesc.split(".");

      setIconLibrary(iconParts[0]?.trim() || "");
      setIconStyle(iconParts[1]?.trim() || "");
    }

    const iconSizesSection = getSection("## Icons");
    const parsedIconSizes: IconSize[] = [];

    for (const line of iconSizesSection) {
      const match = line.match(
        /^\|\s*([^|]+)\s*\|\s*`([^`]+)`\s*\|$/,
      );

      if (
        match &&
        !match[1].includes("---") &&
        match[1].trim() !== "Context"
      ) {
        parsedIconSizes.push({
          context: match[1].trim(),
          size: match[2].trim(),
        });
      }
    }

    if (parsedIconSizes.length > 0) setIconSizes(parsedIconSizes);

    const motionSection = getSection("## Motion");
    const motionUseIndex = motionSection.findIndex((line) =>
      line.includes("Use animation for"),
    );
    const motionAvoidIndex = motionSection.findIndex((line) =>
      line.includes("Avoid"),
    );

    if (motionUseIndex !== -1 && motionAvoidIndex !== -1) {
      const useLines = motionSection
        .slice(motionUseIndex + 1, motionAvoidIndex)
        .map(stripBullet)
        .filter(Boolean);

      const avoidLines = motionSection
        .slice(motionAvoidIndex + 1)
        .map(stripBullet)
        .filter(Boolean);

      if (useLines.length > 0) setMotionUse(useLines);
      if (avoidLines.length > 0) setMotionAvoid(avoidLines);
    }

    const accessibilitySection = getSection("## Accessibility");
    const parsedAccessibility = cleanLines(accessibilitySection)
      .map(stripBullet)
      .filter(Boolean);

    if (parsedAccessibility.length > 0) {
      setAccessibilityRules(parsedAccessibility);
    }
  };

  useEffect(() => {
    if (!projectId) return;

    const loadDocument = async () => {
      try {
        setIsLoading(true);

        const response = await fetch(
          `/api/projects/${projectId}/context/ui-context`,
        );

        const data = await response.json();

        if (!response.ok || !data.success) {
          throw new Error(
            data.error || "Failed to load ui-context",
          );
        }

        const document =
          data.document as UIContextDocument | null;

        if (document?.content) {
          setHasDocument(true);
          parseMarkdown(document.content);
        }
      } catch (error) {
        console.error("Load ui-context error:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadDocument();
  }, [projectId]);

  const updateListItem = (
    list: string[],
    setList: (value: string[]) => void,
    index: number,
    value: string,
  ) => {
    const updated = [...list];
    updated[index] = value;
    setList(updated);
  };

  const addListItem = (
    list: string[],
    setList: (value: string[]) => void,
  ) => {
    setList([...list, ""]);
  };

  const removeListItem = (
    list: string[],
    setList: (value: string[]) => void,
    index: number,
  ) => {
    if (list.length === 1) {
      setList([""]);
      return;
    }

    setList(
      list.filter(
        (_, itemIndex) => itemIndex !== index,
      ),
    );
  };

  const canSave =
    theme.trim() !== "" &&
    colors.some(
      (color) =>
        color.role.trim() &&
        color.cssVariable.trim() &&
        color.hexValue.trim(),
    );

  const buildMarkdown = () => {
    const clean = (value: string) => value.trim();

    const list = (items: string[]) =>
      items
        .map(clean)
        .filter(Boolean)
        .map((item) => `- ${item}`)
        .join("\n") || "Not specified";

    const colorRows = colors
      .filter(
        (color) =>
          color.role.trim() ||
          color.cssVariable.trim() ||
          color.hexValue.trim(),
      )
      .map(
        (color) =>
          `| ${clean(color.role)} | \`${clean(color.cssVariable)}\` | \`${clean(color.hexValue)}\` |`,
      )
      .join("\n") || "| | | |";

    const typographyRows = typography
      .filter(
        (item) =>
          item.role.trim() ||
          item.font.trim() ||
          item.cssVariable.trim(),
      )
      .map(
        (item) =>
          `| ${clean(item.role)} | ${clean(item.font)} | \`${clean(item.cssVariable)}\` |`,
      )
      .join("\n") || "| | | |";

    const radiusRows = radii
      .filter(
        (item) =>
          item.context.trim() || item.value.trim(),
      )
      .map(
        (item) =>
          `| ${clean(item.context)} | \`${clean(item.value)}\` |`,
      )
      .join("\n") || "| | |";

    const layoutSections = layoutPatterns
      .filter(
        (layout) =>
          layout.name.trim() ||
          layout.rules.some((rule) => rule.trim()),
      )
      .map((layout) => {
        return `### ${clean(layout.name) || "Pattern"}

${list(layout.rules)}`;
      })
      .join("\n\n") || "Not specified";

    const iconSizeRows = iconSizes
      .filter(
        (item) =>
          item.context.trim() || item.size.trim(),
      )
      .map(
        (item) =>
          `| ${clean(item.context)} | \`${clean(item.size)}\` |`,
      )
      .join("\n") || "| | |";

    return `# UI Context

## Theme

${clean(theme) || "Not specified"}

${clean(themeAvoid) || "Avoid excessive gradients, glowing effects, neon colors."}

All colors are defined as CSS custom properties in \`globals.css\`.
Components must use these tokens — no arbitrary colors or hardcoded hex values.

## Colors

| Role | CSS Variable | Hex / Value |
| --- | --- | --- |
${colorRows}

## Typography

| Role | Font | CSS Variable |
| --- | --- | --- |
${typographyRows}

${clean(typographyNote) || "Use size/weight/spacing, not color, for hierarchy."}

## Border Radius

| Context | Class |
| --- | --- |
${radiusRows}

Use the defined scale consistently — do not mix arbitrary radius values.

## Component Library

${clean(componentLibrary) || "shadcn/ui on top of Tailwind."}

Components live in: \`${clean(componentPath) || "components/ui"}\`

${clean(componentRule) || "Use existing components when available. Do not recreate primitives from scratch."}

## Layout Patterns

${layoutSections}

## Buttons and Actions

${list(buttonRules)}

Do not use multiple competing accent colors in the same action group.

## Icons

${clean(iconLibrary) || "Lucide React"}. ${clean(iconStyle) || "Stroke-based only."}

| Context | Size |
| --- | --- |
${iconSizeRows}

## Motion

Use animation for:

${list(motionUse)}

Avoid:

${list(motionAvoid)}

## Accessibility

${list(accessibilityRules)}
`;
  };

  const handleSave = async () => {
    if (!canSave || isSaving) return;

    setIsSaving(true);

    try {
      const answers = {
        theme,
        themeAvoid,
        colors,
        typography,
        typographyNote,
        radii,
        componentLibrary,
        componentPath,
        componentRule,
        layoutPatterns,
        buttonRules,
        iconLibrary,
        iconStyle,
        iconSizes,
        motionUse,
        motionAvoid,
        accessibilityRules,
      };

      const response = await fetch(
        `/api/projects/${projectId}/context/ui-context`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ answers }),
        },
      );

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to save ui-context.md",
        );
      }

      setHasDocument(true);
    } catch (error) {
      console.error("Save ui-context error:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDownload = () => {
    if (!canSave) return;

    const blob = new Blob([buildMarkdown()], {
      type: "text/markdown;charset=utf-8",
    });

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");

    link.href = url;
    link.download = "ui-context.md";

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <main className="min-h-screen bg-base">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <p className="text-sm text-copy-muted">
            Loading ui-context...
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-base">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <button
          type="button"
          onClick={() =>
            router.push(
              `/dashboard/projects/${projectId}`,
            )
          }
          className="inline-flex items-center gap-2 text-sm text-copy-muted transition hover:text-copy-primary"
        >
          <ArrowLeft className="size-4" />
          Back to Project
        </button>

        <div className="mt-8">
          <p className="font-mono text-xs text-brand">
            ui-context.md
          </p>

          <h1 className="mt-2 text-3xl font-semibold text-copy-primary">
            UI Context
          </h1>

          <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
            Define the visual system, components, layouts, and interface rules.
          </p>
        </div>

        <div className="mt-10 space-y-8">
          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Theme</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Theme Description
                </label>
                <textarea
                  value={theme}
                  onChange={(e) => setTheme(e.target.value)}
                  rows={3}
                  placeholder="Clean, calm, structured, premium"
                  className="w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  What to Avoid
                </label>
                <input
                  value={themeAvoid}
                  onChange={(e) => setThemeAvoid(e.target.value)}
                  placeholder="Avoid excessive gradients, glowing effects, neon colors"
                  className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Colors</h2>
            <div className="mt-6 space-y-3">
              {colors.map((color, index) => (
                <div
                  key={index}
                  className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <input
                    value={color.role}
                    onChange={(e) => {
                      const updated = [...colors];
                      updated[index].role = e.target.value;
                      setColors(updated);
                    }}
                    placeholder="Page background"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={color.cssVariable}
                    onChange={(e) => {
                      const updated = [...colors];
                      updated[index].cssVariable = e.target.value;
                      setColors(updated);
                    }}
                    placeholder="--bg-base"
                    className="rounded-xl border border-default bg-base px-4 py-3 font-mono text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={color.hexValue}
                    onChange={(e) => {
                      const updated = [...colors];
                      updated[index].hexValue = e.target.value;
                      setColors(updated);
                    }}
                    placeholder="#F7F6F3"
                    className="rounded-xl border border-default bg-base px-4 py-3 font-mono text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (colors.length === 1) {
                        setColors([{ role: "", cssVariable: "", hexValue: "" }]);
                      } else {
                        setColors(colors.filter((_, i) => i !== index));
                      }
                    }}
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setColors([...colors, { role: "", cssVariable: "", hexValue: "" }])
              }
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Color
            </button>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Typography</h2>
            <div className="mt-6 space-y-3">
              {typography.map((item, index) => (
                <div
                  key={index}
                  className="grid gap-2 md:grid-cols-[1fr_1fr_1fr_auto]"
                >
                  <input
                    value={item.role}
                    onChange={(e) => {
                      const updated = [...typography];
                      updated[index].role = e.target.value;
                      setTypography(updated);
                    }}
                    placeholder="UI text"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={item.font}
                    onChange={(e) => {
                      const updated = [...typography];
                      updated[index].font = e.target.value;
                      setTypography(updated);
                    }}
                    placeholder="Inter"
                    className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={item.cssVariable}
                    onChange={(e) => {
                      const updated = [...typography];
                      updated[index].cssVariable = e.target.value;
                      setTypography(updated);
                    }}
                    placeholder="--font-sans"
                    className="rounded-xl border border-default bg-base px-4 py-3 font-mono text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (typography.length === 1) {
                        setTypography([{ role: "", font: "", cssVariable: "" }]);
                      } else {
                        setTypography(typography.filter((_, i) => i !== index));
                      }
                    }}
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setTypography([...typography, { role: "", font: "", cssVariable: "" }])
              }
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Typography
            </button>
            <div className="mt-4">
              <label className="mb-2 block text-sm font-medium">
                Hierarchy Note
              </label>
              <input
                value={typographyNote}
                onChange={(e) => setTypographyNote(e.target.value)}
                placeholder="Use size/weight/spacing, not color, for hierarchy"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Border Radius</h2>
            <div className="mt-6 space-y-3">
              {radii.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item.context}
                    onChange={(e) => {
                      const updated = [...radii];
                      updated[index].context = e.target.value;
                      setRadii(updated);
                    }}
                    placeholder="Buttons / inputs"
                    className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <input
                    value={item.value}
                    onChange={(e) => {
                      const updated = [...radii];
                      updated[index].value = e.target.value;
                      setRadii(updated);
                    }}
                    placeholder="12px"
                    className="w-32 rounded-xl border border-default bg-base px-4 py-3 font-mono text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (radii.length === 1) {
                        setRadii([{ context: "", value: "" }]);
                      } else {
                        setRadii(radii.filter((_, i) => i !== index));
                      }
                    }}
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() => setRadii([...radii, { context: "", value: "" }])}
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Radius
            </button>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Component Library</h2>
            <div className="mt-6 space-y-4">
              <input
                value={componentLibrary}
                onChange={(e) => setComponentLibrary(e.target.value)}
                placeholder="shadcn/ui on top of Tailwind"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
              <input
                value={componentPath}
                onChange={(e) => setComponentPath(e.target.value)}
                placeholder="components/ui"
                className="w-full rounded-xl border border-default bg-base px-4 py-3 font-mono text-sm outline-none focus:border-brand"
              />
              <textarea
                value={componentRule}
                onChange={(e) => setComponentRule(e.target.value)}
                rows={3}
                placeholder="Use existing components when available. Do not recreate primitives from scratch."
                className="w-full resize-none rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
              />
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Layout Patterns</h2>
            <div className="mt-6 space-y-5">
              {layoutPatterns.map((pattern, patternIndex) => (
                <div key={patternIndex} className="rounded-xl border border-default p-4">
                  <div className="flex gap-2">
                    <input
                      value={pattern.name}
                      onChange={(e) => {
                        const updated = [...layoutPatterns];
                        updated[patternIndex].name = e.target.value;
                        setLayoutPatterns(updated);
                      }}
                      placeholder="Pattern name"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm font-medium outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (layoutPatterns.length === 1) {
                          setLayoutPatterns([{ name: "", rules: [""] }]);
                        } else {
                          setLayoutPatterns(
                            layoutPatterns.filter((_, i) => i !== patternIndex),
                          );
                        }
                      }}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  <div className="mt-3 space-y-2">
                    {pattern.rules.map((rule, ruleIndex) => (
                      <div key={ruleIndex} className="flex gap-2">
                        <input
                          value={rule}
                          onChange={(e) => {
                            const updated = [...layoutPatterns];
                            updated[patternIndex].rules[ruleIndex] =
                              e.target.value;
                            setLayoutPatterns(updated);
                          }}
                          placeholder="Rule"
                          className="flex-1 rounded-xl border border-default bg-base px-4 py-2.5 text-sm outline-none focus:border-brand"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const updated = [...layoutPatterns];
                            if (updated[patternIndex].rules.length === 1) {
                              updated[patternIndex].rules = [""];
                            } else {
                              updated[patternIndex].rules = updated[
                                patternIndex
                              ].rules.filter((_, i) => i !== ruleIndex);
                            }
                            setLayoutPatterns(updated);
                          }}
                          className="rounded-xl border border-default px-3 text-red-400"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      const updated = [...layoutPatterns];
                      updated[patternIndex].rules.push("");
                      setLayoutPatterns(updated);
                    }}
                    className="mt-2 inline-flex items-center gap-2 text-xs font-medium text-brand"
                  >
                    <Plus className="size-3.5" />
                    Add Rule
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                setLayoutPatterns([
                  ...layoutPatterns,
                  { name: "", rules: [""] },
                ])
              }
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Pattern
            </button>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Icons</h2>
            <div className="mt-6 space-y-4">
              <div className="grid gap-2 md:grid-cols-2">
                <input
                  value={iconLibrary}
                  onChange={(e) => setIconLibrary(e.target.value)}
                  placeholder="Lucide React"
                  className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                />
                <input
                  value={iconStyle}
                  onChange={(e) => setIconStyle(e.target.value)}
                  placeholder="Stroke-based only"
                  className="rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                />
              </div>
              <div className="space-y-2">
                {iconSizes.map((item, index) => (
                  <div key={index} className="flex gap-2">
                    <input
                      value={item.context}
                      onChange={(e) => {
                        const updated = [...iconSizes];
                        updated[index].context = e.target.value;
                        setIconSizes(updated);
                      }}
                      placeholder="Inline"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                    />
                    <input
                      value={item.size}
                      onChange={(e) => {
                        const updated = [...iconSizes];
                        updated[index].size = e.target.value;
                        setIconSizes(updated);
                      }}
                      placeholder="size-4"
                      className="w-32 rounded-xl border border-default bg-base px-4 py-3 font-mono text-sm outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (iconSizes.length === 1) {
                          setIconSizes([{ context: "", size: "" }]);
                        } else {
                          setIconSizes(iconSizes.filter((_, i) => i !== index));
                        }
                      }}
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={() => setIconSizes([...iconSizes, { context: "", size: "" }])}
                className="inline-flex items-center gap-2 text-sm font-medium text-brand"
              >
                <Plus className="size-4" />
                Add Icon Size
              </button>
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Motion</h2>
            <div className="mt-6 space-y-4">
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Use Animation For
                </label>
                {motionUse.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      value={item}
                      onChange={(e) =>
                        updateListItem(motionUse, setMotionUse, index, e.target.value)
                      }
                      placeholder="Panel transitions"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeListItem(motionUse, setMotionUse, index)
                      }
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(motionUse, setMotionUse)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                >
                  <Plus className="size-4" />
                  Add
                </button>
              </div>
              <div>
                <label className="mb-2 block text-sm font-medium">
                  Avoid
                </label>
                {motionAvoid.map((item, index) => (
                  <div key={index} className="flex gap-2 mb-2">
                    <input
                      value={item}
                      onChange={(e) =>
                        updateListItem(motionAvoid, setMotionAvoid, index, e.target.value)
                      }
                      placeholder="Constant looping animations"
                      className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        removeListItem(motionAvoid, setMotionAvoid, index)
                      }
                      className="rounded-xl border border-default px-3 text-red-400"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => addListItem(motionAvoid, setMotionAvoid)}
                  className="inline-flex items-center gap-2 text-sm font-medium text-brand"
                >
                  <Plus className="size-4" />
                  Add
                </button>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-default bg-surface p-6">
            <h2 className="text-lg font-semibold">Accessibility</h2>
            <div className="mt-6 space-y-2">
              {accessibilityRules.map((item, index) => (
                <div key={index} className="flex gap-2">
                  <input
                    value={item}
                    onChange={(e) =>
                      updateListItem(
                        accessibilityRules,
                        setAccessibilityRules,
                        index,
                        e.target.value,
                      )
                    }
                    placeholder="Maintain readable contrast"
                    className="flex-1 rounded-xl border border-default bg-base px-4 py-3 text-sm outline-none focus:border-brand"
                  />
                  <button
                    type="button"
                    onClick={() =>
                      removeListItem(
                        accessibilityRules,
                        setAccessibilityRules,
                        index,
                      )
                    }
                    className="rounded-xl border border-default px-3 text-red-400"
                  >
                    <X className="size-4" />
                  </button>
                </div>
              ))}
            </div>
            <button
              type="button"
              onClick={() =>
                addListItem(accessibilityRules, setAccessibilityRules)
              }
              className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-brand"
            >
              <Plus className="size-4" />
              Add Rule
            </button>
          </section>

          <section className="sticky bottom-6 rounded-2xl border border-default bg-surface/95 p-4 shadow-xl backdrop-blur">
            <div className="flex items-center justify-between gap-4">
              <div>
                <p className="text-sm font-medium text-copy-primary">
                  ui-context.md
                </p>
                <p className="mt-1 text-xs text-copy-muted">
                  {hasDocument
                    ? "Edit the ui-context and save your changes."
                    : "Generate the ui-context file."}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-2 rounded-xl border border-default px-4 py-2.5 text-sm font-medium text-copy-primary transition hover:border-brand hover:text-brand disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <Download className="size-4" />
                  Download
                </button>
                <button
                  type="button"
                  onClick={handleSave}
                  className="inline-flex items-center gap-2 rounded-xl bg-brand px-5 py-2.5 text-sm font-medium text-white transition hover:bg-brand-dark disabled:cursor-not-allowed disabled:opacity-40"
                >
                  {isSaving ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <Save className="size-4" />
                  )}

                  Save
                </button>
              </div>
            </div>
          </section>
        </div>
      </div>
    </main>
  );
}