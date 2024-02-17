import {
  asset,
  clientStore,
  editor,
  markdown,
  space,
  system,
} from "$sb/syscalls.ts";
import { renderMarkdownToHtml } from "./markdown_render.ts";
import { resolveAttachmentPath } from "$sb/lib/resolve.ts";
import { expandCodeWidgets } from "./api.ts";
import { readSettings } from "$sb/lib/settings_page.ts";

export async function updateMarkdownPreview() {
  if (!(await clientStore.get("enableMarkdownPreview"))) {
    return;
  }
  const setting = await readSettings({ previewOnRHS: true, sidePage: "" });
  const currentPage = setting.sidePage
    ? setting.sidePage
    : await editor.getCurrentPage();
  const text = setting.sidePage
    ? await space.readPage(currentPage)
    : await editor.getText();
  const mdTree = await markdown.parseMarkdown(text);
  // const cleanMd = await cleanMarkdown(text);
  const css = await asset.readAsset("markdown", "assets/preview.css");
  const js = await asset.readAsset("markdown", "assets/preview.js");

  await expandCodeWidgets(mdTree, currentPage);
  const html = renderMarkdownToHtml(mdTree, {
    smartHardBreak: true,
    annotationPositions: true,
    translateUrls: (url) => {
      if (!url.includes("://")) {
        url = resolveAttachmentPath(currentPage, decodeURI(url));
      }
      return url;
    },
  });
  await editor.showPanel(
    setting.previewOnRHS ? "rhs" : "lhs",
    2,
    `<html><head><style>${css}</style></head><body><div id="root">${html}</div></body></html>`,
    js,
  );
}

export async function previewClickHandler(e: any) {
  const [eventName, arg] = JSON.parse(e);
  // console.log("Got click", eventName, arg);
  switch (eventName) {
    case "pos":
      // console.log("Moving cursor to", +arg);
      await editor.moveCursor(+arg, true);
      break;
    case "command":
      await system.invokeCommand(arg);
      break;
  }
}
