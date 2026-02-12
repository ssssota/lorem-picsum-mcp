import { defineApp, defineTool } from "chapplin";
import { Show } from "solid-js";
import z from "zod";

export const tool = defineTool({
  name: "get_image",
  config: {
    description: "Get image by ID",
    inputSchema: {
      id: z.int().nonnegative().describe("Image ID"),
      scale: z
        .object({
          width: z
            .number()
            .int()
            .positive()
            .describe(
              "Width in pixels. If not provided, original width is used",
            ),
          height: z
            .number()
            .int()
            .positive()
            .describe(
              "Height in pixels. If not provided, original height is used",
            ),
        })
        .optional(),
    },
    outputSchema: {
      url: z.url().describe("Image URL"),
    },
  },
  async handler(args) {
    const resp = await fetch(`https://picsum.photos/id/${args.id}/info`);
    if (!resp.ok) {
      return { content: [{ type: "text", text: "Image not found" }] };
    }
    const data: {
      id: string;
      author: string;
      width: number;
      height: number;
      url: string;
      download_url: string;
    } = await resp.json();

    const url = args.scale
      ? `https://picsum.photos/id/${data.id}/${args.scale.width}/${args.scale.height}`
      : data.download_url;

    return {
      content: [{ type: "text", text: "Image found" }],
      structuredContent: { url },
      _meta: { info: data },
    };
  },
});

export const app = defineApp<typeof tool>({
  config: {
    appInfo: { name: "get_image", version: "1.0.0" },
  },
  meta: {
    csp: {
      resourceDomains: ["https://picsum.photos", "https://fastly.picsum.photos"],
    },
  },
  ui(props) {
    return (
      <Show when={props.output} fallback={<p>Loading...</p>}>
        <div>
          <h1>Image Found (ID:{props.output?._meta?.info.id})</h1>
          <img src={props.output?.structuredContent?.url} alt="Fetched Image" />
        </div>
      </Show>
    );
  },
});
