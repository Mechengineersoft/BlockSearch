import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useAuth } from "@/hooks/use-auth";
import { SearchResult } from "@shared/schema";
import { useQuery } from "@tanstack/react-query";
import { LogOut, Search, Loader2, X } from "lucide-react";
import { useState } from "react";

export default function HomePage() {
  const { logoutMutation } = useAuth();
  const [blockNo, setBlockNo] = useState("");
  const [partNo, setPartNo] = useState("");
  const [thickness, setThickness] = useState("");

  const { data: results, isLoading, error } = useQuery<SearchResult[]>({
    queryKey: ["/api/search", blockNo, partNo, thickness],
    enabled: blockNo.trim().length > 0,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (blockNo.trim()) params.append('blockNo', blockNo.trim());
      if (partNo.trim()) params.append('partNo', partNo.trim());
      if (thickness.trim()) params.append('thickness', thickness.trim());

      const response = await fetch(`/api/search?${params}`);
      if (!response.ok) {
        throw new Error(`${response.status}: ${await response.text()}`);
      }
      return response.json();
    }
  });

  const handleClear = () => {
    setBlockNo("");
    setPartNo("");
    setThickness("");
  };

  // Show color samples from the first result if available
  const headerColors = results?.[0] ? {
    color1: results[0].color1,
    color2: results[0].color2,
  } : null;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <h1 className="text-2xl font-bold">Sheet Search</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <LogOut className="h-5 w-5" />
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="pt-6">
            <div className="grid gap-4 md:grid-cols-3 mb-6">
              <div>
                <div className="space-y-2">
                  <Input
                    placeholder="Block No (required)"
                    value={blockNo}
                    onChange={(e) => setBlockNo(e.target.value)}
                  />
                  {blockNo.trim().length === 0 && (
                    <p className="text-sm text-destructive">Block number is required</p>
                  )}
                </div>
              </div>
              <div>
                <Input
                  placeholder="Part No"
                  value={partNo}
                  onChange={(e) => setPartNo(e.target.value)}
                />
              </div>
              <div>
                <Input
                  placeholder="Thickness"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={handleClear}>
                <X className="mr-2 h-4 w-4" />
                Clear
              </Button>
            </div>

            {error ? (
              <div className="text-center text-destructive my-8">
                <p>Failed to fetch search results. Please try again later.</p>
                <p className="text-sm mt-2">Error: {error.message}</p>
              </div>
            ) : headerColors && (
              <div className="flex gap-4 my-6">
                <div 
                  className="p-4 rounded-lg flex-1 text-center font-semibold"
                  style={{ backgroundColor: headerColors.color1 }}
                >
                  Color 1: {headerColors.color1}
                </div>
                <div 
                  className="p-4 rounded-lg flex-1 text-center font-semibold"
                  style={{ backgroundColor: headerColors.color2 }}
                >
                  Color 2: {headerColors.color2}
                </div>
              </div>
            )}

            {isLoading ? (
              <div className="flex justify-center my-8">
                <Loader2 className="h-8 w-8 animate-spin" />
              </div>
            ) : results?.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Block No</TableHead>
                    <TableHead>Part No</TableHead>
                    <TableHead>Thickness</TableHead>
                    <TableHead>Nos</TableHead>
                    <TableHead>Color 1</TableHead>
                    <TableHead>Color 2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, i) => (
                    <TableRow key={i}>
                      <TableCell>{result.blockNo}</TableCell>
                      <TableCell>{result.partNo}</TableCell>
                      <TableCell>{result.thickness}</TableCell>
                      <TableCell>{result.nos}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: result.color1 }}
                          />
                          {result.color1}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-6 h-6 rounded"
                            style={{ backgroundColor: result.color2 }}
                          />
                          {result.color2}
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : blockNo.trim().length > 0 ? (
              <p className="text-center text-muted-foreground my-8">No results found</p>
            ) : (
              <p className="text-center text-muted-foreground my-8">Enter a block number to search</p>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}