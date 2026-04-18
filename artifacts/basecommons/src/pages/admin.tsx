import { Layout } from "@/components/layout";
import { 
  useGetPlatformStats, 
  useGetFundingCycles,
  getGetPlatformStatsQueryKey,
  getGetFundingCyclesQueryKey
} from "@workspace/api-client-react";
import { formatWeiToEth } from "@/lib/web3";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, RefreshCw, BarChart, Database, ShieldAlert } from "lucide-react";
import { format } from "date-fns";

export default function Admin() {
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() }
  });

  const { data: cycles, isLoading: cyclesLoading } = useGetFundingCycles({
    query: { queryKey: getGetFundingCyclesQueryKey() }
  });

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-10 gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight mb-2 flex items-center gap-2">
              <Settings className="text-muted-foreground" /> Protocol Admin
            </h1>
            <p className="text-muted-foreground">Manage funding cycles and platform parameters.</p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" className="font-bold border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Add Matching Funds
            </Button>
            <Button className="font-bold bg-destructive text-destructive-foreground hover:bg-destructive/90">
              End Current Cycle
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Current Cycle Status
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-24" /> : (
                <div className="text-3xl font-bold">Cycle #{stats?.currentCycleId}</div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Active and accepting donations</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Matching Pool
                <Database size={16} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-32" /> : (
                <div className="text-3xl font-bold font-mono">{formatWeiToEth(stats?.matchingPoolWei)} <span className="text-base font-sans font-normal text-muted-foreground">ETH</span></div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Available for distribution</p>
            </CardContent>
          </Card>

          <Card className="bg-card border-border shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex justify-between items-center">
                Total Distributed
                <BarChart size={16} />
              </CardTitle>
            </CardHeader>
            <CardContent>
              {statsLoading ? <Skeleton className="h-8 w-32" /> : (
                <div className="text-3xl font-bold font-mono">{formatWeiToEth(stats?.totalDistributedWei)} <span className="text-base font-sans font-normal text-muted-foreground">ETH</span></div>
              )}
              <p className="text-xs text-muted-foreground mt-1">Across all past cycles</p>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-card border-border shadow-sm mb-10">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Funding Cycle History</CardTitle>
            <CardDescription>Historical data of past quadratic funding rounds</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/20 border-b border-border">
                  <tr>
                    <th className="px-6 py-4 font-semibold">Cycle ID</th>
                    <th className="px-6 py-4 font-semibold">End Date</th>
                    <th className="px-6 py-4 font-semibold">Projects</th>
                    <th className="px-6 py-4 font-semibold">Donations</th>
                    <th className="px-6 py-4 font-semibold">Matching Distributed</th>
                    <th className="px-6 py-4 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border/50">
                  {cyclesLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-8" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-12" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-16" /></td>
                        <td className="px-6 py-4"><Skeleton className="h-4 w-24" /></td>
                        <td className="px-6 py-4 text-right"><Skeleton className="h-8 w-20 ml-auto" /></td>
                      </tr>
                    ))
                  ) : cycles?.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-8 text-center text-muted-foreground">
                        No completed cycles yet.
                      </td>
                    </tr>
                  ) : (
                    cycles?.map((cycle) => (
                      <tr key={cycle.cycleId} className="hover:bg-muted/20 transition-colors">
                        <td className="px-6 py-4 font-medium">#{cycle.cycleId}</td>
                        <td className="px-6 py-4">
                          {cycle.endedAt ? format(new Date(cycle.endedAt), "MMM d, yyyy") : "-"}
                        </td>
                        <td className="px-6 py-4">{cycle.projectCount}</td>
                        <td className="px-6 py-4">{cycle.donationCount}</td>
                        <td className="px-6 py-4 font-mono font-medium">{formatWeiToEth(cycle.totalMatchingDistributedWei)} ETH</td>
                        <td className="px-6 py-4 text-right">
                          <Button variant="ghost" size="sm" className="h-8">View Report</Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="bg-destructive/10 border border-destructive/20 rounded-xl p-6 flex gap-4">
          <ShieldAlert className="text-destructive shrink-0" size={24} />
          <div>
            <h3 className="text-lg font-bold text-destructive mb-1">Danger Zone</h3>
            <p className="text-sm text-foreground/80 mb-4 max-w-2xl">
              These actions directly interact with the smart contract and cannot be undone. Ending a cycle will calculate final quadratic matching amounts and lock all project state.
            </p>
            <div className="flex gap-3">
              <Button variant="outline" className="border-destructive text-destructive hover:bg-destructive hover:text-white">
                Emergency Pause Contract
              </Button>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}