'use server';

import { ai } from '@/ai/genkit';
import { gemini20Flash } from '@genkit-ai/googleai';
import { z } from 'zod';

/**
 * @fileOverview AI Flow that translates natural language into actionable GIS intents.
 */

const SpatialIntentInputSchema = z.object({
  prompt: z.string().describe('The user command in natural language.'),
  featureContext: z
    .string()
    .optional()
    .describe('Brief summary of existing map features (types, count).'),
});
export type SpatialIntentInput = z.infer<typeof SpatialIntentInputSchema>;

const SpatialIntentOutputSchema = z.object({
  action: z
    .enum([
      'buffer',
      'centroid',
      'convexHull',
      'bbox',
      'simplify',
      'union',
      'unkink',
      'calculateField',
      'flyTo',
      'fitBounds',
      'setBasemap',
      'setProjection',
      'clear',
      'delete',
      'style',
      'export',
      'loadUrl',
      'setProperty',
      'analyze',
      'unknown',
    ])
    .describe('The specific GIS operation inferred from the prompt.'),
  params: z
    .object({
      radius: z.number().optional().describe('Radius for buffer (default units: km).'),
      units: z.enum(['meters', 'kilometers', 'miles', 'degrees']).optional(),
      query: z.string().optional().describe('Search query for location fly-to.'),
      basemap: z.string().optional().describe('Name of the basemap (osm, satellite, topo, dark).'),
      projection: z.string().optional().describe('Projection code (EPSG:4326, EPSG:3857).'),
      target: z
        .enum(['all', 'selected', 'last'])
        .optional()
        .describe('Which feature(s) to target.'),
      color: z.string().optional().describe('CSS color for styling (e.g., #ff0000, red).'),
      strokeWidth: z.number().optional().describe('Width for strokes.'),
      opacity: z.number().optional().describe('Opacity value between 0 and 1.'),
      exportFormat: z
        .enum(['geojson', 'topojson', 'kml', 'kmz', 'csv', 'wkt'])
        .optional()
        .describe('Format for data export.'),
      url: z.string().optional().describe('Remote URL to fetch and load GeoJSON from.'),
      propKey: z.string().optional().describe('Property key name to set.'),
      propValue: z
        .union([z.string(), z.number()])
        .optional()
        .describe('Property value to assign.'),
    })
    .optional(),
  narrative: z.string().describe('A short user-friendly response explaining what the AI is doing.'),
});
export type SpatialIntentOutput = z.infer<typeof SpatialIntentOutputSchema>;

const spatialIntentPrompt = ai.definePrompt({
  name: 'spatialIntentPrompt',
  model: gemini20Flash,
  input: { schema: SpatialIntentInputSchema },
  output: { schema: SpatialIntentOutputSchema },
  prompt: `You are the core intelligence of Geovara, a professional GIS platform.
Your job is to translate user natural language commands into structured JSON actions.

**Context of current map:**
{{{input.featureContext}}}

**User Prompt:**
{{{input.prompt}}}

**Rules for 'action' selection:**
1. 'flyTo': If the user mentions a location to navigate to (e.g., "Take me to Paris", "Go to Jakarta").
2. 'buffer': If the user asks for a buffer creation (e.g., "Buffer this by 1km").
3. 'centroid': If the user asks for the center point (e.g., "Calculate center", "Find middle").
4. 'convexHull': If the user asks for a convex hull / envelope (e.g., "Create convex hull", "Wrap points").
5. 'bbox': If the user asks for a bounding box polygon (e.g., "Generate bounding box", "Bbox polygon").
6. 'simplify': If the user asks to simplify lines/polygons (e.g., "Make this less complex").
7. 'union': If the user asks to merge/combine geometries (e.g., "Union features", "Combine polygons").
8. 'setBasemap': If the user asks to change the background map (e.g., "Switch to satellite", "Show dark mode"). 
9. 'setProjection': If the user asks to change the coordinate system (e.g., "Use EPSG:4326", "Switch to Web Mercator").
10. 'clear': If the user asks to remove everything or clear the map.
11. 'delete': If the user asks to delete the selected feature.
12. 'style': If the user asks to change appearance (e.g., "Make points red", "Set opacity to 50%", "Heavier lines").
13. 'export': If the user wants to download/save data (e.g., "Download as TopoJSON", "Save to KML", "Export to CSV", "Save as WKT").
14. 'loadUrl': If the user provides a link to fetch (e.g., "Load GeoJSON from https://...", "Buka URL https://...").
15. 'setProperty': If the user asks to add or change feature attributes (e.g., "Set property status to active", "Beri nama Monas").
16. 'analyze': If the user asks for stats or measurements (e.g., "What is the total area?", "How many points?").

**Rules for 'params':**
- For 'style', extract color (hex or named), strokeWidth, or opacity (0-1).
- For 'export', set 'exportFormat' ('geojson', 'topojson', 'kml', 'kmz', 'csv', 'wkt').
- For 'loadUrl', extract the http/https URL into 'url'.
- For 'setProperty', extract 'propKey' and 'propValue'.
- For 'buffer', default radius is 1 and units is 'kilometers'.
- For 'flyTo', extract the location name into 'query'.
- For 'setBasemap', valid values are 'osm', 'satellite', 'topo', 'dark'.
- For 'setProjection', valid values are 'EPSG:4326', 'EPSG:3857'.

**Output Requirements:**
- Return ONLY the JSON object.
- Provide a short, polite 'narrative' (max 12 words).
- If internal logic is unclear, use 'unknown'.

Respond strictly in JSON.`,
});

export type ProcessIntentResult =
  | { success: true; data: SpatialIntentOutput }
  | { success: false; error: string; isQuotaExceeded: boolean };

export async function processSpatialIntent(
  prompt: string,
  featureContext?: string
): Promise<ProcessIntentResult> {
  try {
    const { output } = await spatialIntentPrompt({ prompt, featureContext });
    if (!output) {
      return { success: false, error: 'AI returned an empty response.', isQuotaExceeded: false };
    }
    return { success: true, data: output };
  } catch (error) {
    console.error('Error in processSpatialIntent:', error);
    const err = error as { message?: string; status?: number };
    const message = err?.message || '';
    const isQuotaExceeded =
      message.includes('429') ||
      message.toLowerCase().includes('quota') ||
      message.toLowerCase().includes('rate limit') ||
      err?.status === 429;

    return {
      success: false,
      error: isQuotaExceeded
        ? 'AI Quota exceeded. Please try again later.'
        : 'Failed to process AI command.',
      isQuotaExceeded,
    };
  }
}
