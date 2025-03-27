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
    color1: results[0].row[21],
    color2: results[0].row[22],
  } : null;

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <header className="border-b sticky top-0 bg-background z-10">
        <div className="container mx-auto px-4 h-12 flex items-center justify-between">
          <h1 className="text-xl font-bold">Sheet Search</h1>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            {logoutMutation.isPending ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <LogOut className="h-4 w-4" />
            )}
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-4 flex-1">
        <Card className="shadow-sm">
          <CardContent className="pt-4">
            <div className="grid gap-3 md:grid-cols-3 mb-4">
              <div>
                <div className="space-y-1">
                  <Input
                    placeholder="Block No (required)"
                    value={blockNo}
                    onChange={(e) => setBlockNo(e.target.value)}
                    className="h-9"
                  />
                  {blockNo.trim().length === 0 && (
                    <p className="text-xs text-destructive">Block number is required</p>
                  )}
                </div>
              </div>
              <div>
                <Input
                  placeholder="Part No"
                  value={partNo}
                  onChange={(e) => setPartNo(e.target.value)}
                  className="h-9"
                />
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Thickness"
                  value={thickness}
                  onChange={(e) => setThickness(e.target.value)}
                  className="h-9"
                />
              </div>
            </div>
            <div className="flex justify-end mt-2">
              <Button variant="default" size="sm" onClick={handleClear} className="h-9">
                Clear
              </Button>
            </div>

            {error ? (
              <div className="text-center text-destructive my-4">
                <p>Failed to fetch search results. Please try again later.</p>
                <p className="text-sm mt-1">Error: {error.message}</p>
              </div>
            ) : headerColors && (
              <div className="flex gap-3 my-4">
                <div 
                  className="p-3 rounded-lg flex-1 text-center text-sm font-semibold"
                  style={{ backgroundColor: null }}
                >
                  Color 1: {headerColors.color1}
                </div>
                <div 
                  className="p-3 rounded-lg flex-1 text-center text-sm font-semibold"
                  style={{ backgroundColor: null }}
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
                  <TableRow className="bg-blue-700 hover:bg-blue-800">
                    <TableHead className="font-bold text-white">Block No</TableHead>
                    <TableHead className="font-bold text-white">Part</TableHead>
                    <TableHead className="font-bold text-white">Thk cm</TableHead>
                    <TableHead className="font-bold text-white">Nos</TableHead>
                    <TableHead className="font-bold text-white">Grind</TableHead>
                    <TableHead className="font-bold text-white">Net</TableHead>
                    <TableHead className="font-bold text-white">Epoxy</TableHead>
                    <TableHead className="font-bold text-white">Polish</TableHead>
                    <TableHead className="font-bold text-white">Leather</TableHead>
                    <TableHead className="font-bold text-white">Lapotra</TableHead>
                    <TableHead className="font-bold text-white">Honed</TableHead>
                    <TableHead className="font-bold text-white">Shot</TableHead>
                    <TableHead className="font-bold text-white">Pol R</TableHead>
                    <TableHead className="font-bold text-white">Bal</TableHead>
                    <TableHead className="font-bold text-white">B SP</TableHead>
                    <TableHead className="font-bold text-white">Edge</TableHead>
                    <TableHead className="font-bold text-white">Meas</TableHead>
                    <TableHead className="font-bold text-white">L cm</TableHead>
                    <TableHead className="font-bold text-white">H cm</TableHead>
                    <TableHead className="font-bold text-white">Status</TableHead>
                    <TableHead className="font-bold text-white">Date</TableHead>
                    <TableHead className="font-bold text-white">Color1</TableHead>
                    <TableHead className="font-bold text-white">Color2</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {results.map((result, i) => (
                    <TableRow key={i} className={`${i % 2 === 0 ? "bg-white hover:bg-gray-100" : "bg-gray-200 hover:bg-gray-300"}`}>
                      <TableCell>{result.blockNo}</TableCell>
                      <TableCell>{result.partNo}</TableCell>
                      <TableCell>{result.thickness}</TableCell>
                      <TableCell>{result.nos}</TableCell>
                      <TableCell>{result.grinding}</TableCell>
                      <TableCell>{result.netting}</TableCell>
                      <TableCell>{result.epoxy}</TableCell>
                      <TableCell>{result.polished}</TableCell>
                      <TableCell>{result.leather}</TableCell>
                      <TableCell>{result.lapotra}</TableCell>
                      <TableCell>{result.honed}</TableCell>
                      <TableCell>{result.shot}</TableCell>
                      <TableCell>{result.polR}</TableCell>
                      <TableCell>{result.bal}</TableCell>
                      <TableCell>{result.bSP}</TableCell>
                      <TableCell>{result.edge}</TableCell>
                      <TableCell>{result.meas}</TableCell>
                      <TableCell>{result.lCm}</TableCell>
                      <TableCell>{result.hCm}</TableCell>
                      <TableCell>{result.status}</TableCell>
                      <TableCell>{result.date}</TableCell>
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