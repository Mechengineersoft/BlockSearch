import { SearchResult } from "@shared/schema";

export async function searchSheetData(blockNo: string, partNo?: string, thickness?: string): Promise<SearchResult[]> {
  const params = new URLSearchParams();
  params.append('blockNo', blockNo);
  if (partNo) params.append('partNo', partNo);
  if (thickness) params.append('thickness', thickness);

  const response = await fetch(`/api/search?${params}`);
  if (!response.ok) {
    throw new Error('Failed to fetch search results');
  }
  return response.json();
}