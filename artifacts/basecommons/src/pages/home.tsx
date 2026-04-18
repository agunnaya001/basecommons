import { Layout } from "@/components/layout";
import { Link } from "wouter";
import { motion } from "framer-motion";
import { 
  useListProjects, 
  useGetPlatformStats, 
  useListRecentDonations, 
  useGetLeaderboard,
  getListProjectsQueryKey,
  getGetPlatformStatsQueryKey,
  getListRecentDonationsQueryKey,
  getGetLeaderboardQueryKey
} from "@workspace/api-client-react";
import { formatWeiToEth, truncateAddress } from "@/lib/web3";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Leaf, ArrowRight, TrendingUp, Users, Activity } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import gardenImg from "@/assets/garden.png";
import openSourceImg from "@/assets/opensource.png";
import musicImg from "@/assets/music.png";
import beesImg from "@/assets/bees.png";

const projectImages: Record<string, string> = {
  "Community Garden": gardenImg,
  "Open Source Dev Tools": openSourceImg,
  "Local Music Scene": musicImg,
  "Urban Beekeeping": beesImg,
};

export default function Home() {
  const { data: stats, isLoading: statsLoading } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() }
  });

  const { data: projects, isLoading: projectsLoading } = useListProjects(
    { sort: "top_matched" },
    { query: { queryKey: getListProjectsQueryKey({ sort: "top_matched" }) } }
  );

  const { data: recentDonations, isLoading: donationsLoading } = useListRecentDonations(
    { limit: 10 },
    { query: { queryKey: getListRecentDonationsQueryKey({ limit: 10 }) } }
  );

  const { data: leaderboard, isLoading: leaderboardLoading } = useGetLeaderboard(
    { limit: 5 },
    { query: { queryKey: getGetLeaderboardQueryKey({ limit: 5 }) } }
  );

  return (
    <Layout>
      {/* Hero Section */}
      <section className="relative pt-24 pb-32 overflow-hidden px-4">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-background -z-10" />
        <div className="container mx-auto max-w-6xl">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-3xl mx-auto"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6 border border-secondary/20">
              <Leaf size={14} />
              <span>Quadratic Funding on Base</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-foreground mb-6 leading-tight">
              Fund the <span className="text-primary italic font-serif pr-2">commons.</span><br />
              Grow the future.
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground mb-10 leading-relaxed max-w-2xl mx-auto">
              Your small contribution ripples into tidal waves of change. Through quadratic funding, we amplify the voice of the community over the capital of the few.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button size="lg" className="rounded-full w-full sm:w-auto text-lg px-8 py-6" asChild>
                <Link href="#projects">Explore Projects</Link>
              </Button>
              <Button size="lg" variant="outline" className="rounded-full w-full sm:w-auto text-lg px-8 py-6 bg-transparent" asChild>
                <Link href="/create">Submit Project</Link>
              </Button>
            </div>
          </motion.div>

          {/* Stats Row */}
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-4"
          >
            {[
              { label: "Matching Pool", value: stats ? `${formatWeiToEth(stats.matchingPoolWei)} ETH` : "-", icon: <TrendingUp className="text-primary mb-2" size={24}/> },
              { label: "Total Donated", value: stats ? `${formatWeiToEth(stats.totalDonationsWei)} ETH` : "-", icon: <Activity className="text-secondary mb-2" size={24}/> },
              { label: "Unique Donors", value: stats?.totalUniqueDonors ?? "-", icon: <Users className="text-muted-foreground mb-2" size={24}/> },
              { label: "Active Projects", value: stats?.activeProjectCount ?? "-", icon: <Leaf className="text-primary mb-2" size={24}/> },
            ].map((stat, i) => (
              <Card key={i} className="bg-card/50 backdrop-blur border-border/50 shadow-sm">
                <CardContent className="p-6 text-center">
                  <div className="flex justify-center">{stat.icon}</div>
                  {statsLoading ? (
                    <Skeleton className="h-8 w-24 mx-auto mb-1" />
                  ) : (
                    <div className="text-2xl font-bold text-foreground mb-1">{stat.value}</div>
                  )}
                  <div className="text-sm font-medium text-muted-foreground uppercase tracking-wider">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </motion.div>
        </div>
      </section>

      <div className="container mx-auto max-w-7xl px-4 py-12 flex flex-col lg:flex-row gap-12" id="projects">
        {/* Main Feed */}
        <div className="flex-1">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-bold tracking-tight">Active Projects</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projectsLoading ? (
              Array.from({ length: 4 }).map((_, i) => (
                <Card key={i} className="overflow-hidden border-border/50 shadow-sm">
                  <Skeleton className="h-48 w-full rounded-none" />
                  <CardContent className="p-6">
                    <Skeleton className="h-6 w-3/4 mb-4" />
                    <Skeleton className="h-4 w-full mb-2" />
                    <Skeleton className="h-4 w-full mb-6" />
                    <div className="flex justify-between">
                      <Skeleton className="h-4 w-1/4" />
                      <Skeleton className="h-4 w-1/4" />
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : projects?.map((project, i) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <Link href={`/project/${project.id}`}>
                  <Card className="h-full overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-all hover:-translate-y-1 group cursor-pointer bg-card">
                    <div className="relative h-48 overflow-hidden bg-muted">
                      {/* Fallback to generated images based on name or random */}
                      <img 
                        src={project.imageUrl || projectImages[project.name] || gardenImg} 
                        alt={project.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-4 left-4">
                        <span className="px-3 py-1 rounded-full bg-background/90 backdrop-blur text-xs font-bold text-foreground shadow-sm">
                          {project.category || "Community"}
                        </span>
                      </div>
                    </div>
                    <CardContent className="p-6 flex flex-col h-[calc(100%-12rem)]">
                      <h3 className="text-xl font-bold mb-2 line-clamp-1 group-hover:text-primary transition-colors">{project.name}</h3>
                      <p className="text-muted-foreground text-sm line-clamp-2 mb-6 flex-1">{project.description}</p>
                      
                      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-border/50 mt-auto">
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Raised</div>
                          <div className="font-mono font-medium">{formatWeiToEth(project.totalDonationsWei)} ETH</div>
                        </div>
                        <div>
                          <div className="text-xs text-muted-foreground mb-1 uppercase tracking-wider font-semibold">Est. Match</div>
                          <div className="font-mono font-medium text-secondary">+{formatWeiToEth(project.estimatedMatchWei)} ETH</div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-8">
          {/* Leaderboard */}
          <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
            <div className="p-5 border-b border-border/50 bg-muted/30">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <TrendingUp size={18} className="text-primary" />
                Leaderboard
              </h3>
            </div>
            <div className="p-0">
              {leaderboardLoading ? (
                <div className="p-5 space-y-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="flex gap-3">
                      <Skeleton className="h-10 w-10 rounded" />
                      <div className="space-y-2 flex-1">
                        <Skeleton className="h-4 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {leaderboard?.map((entry, i) => (
                    <Link key={entry.project.id} href={`/project/${entry.project.id}`} className="flex items-center gap-4 p-4 hover:bg-muted/50 transition-colors">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {entry.rank}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium truncate text-sm">{entry.project.name}</div>
                        <div className="text-xs text-muted-foreground">{entry.matchShare.toFixed(1)}% of pool</div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </Card>

          {/* Recent Activity */}
          <Card className="border-border/50 shadow-sm bg-card overflow-hidden">
            <div className="p-5 border-b border-border/50 bg-muted/30">
              <h3 className="font-bold text-lg flex items-center gap-2">
                <Activity size={18} className="text-secondary" />
                Live Feed
              </h3>
            </div>
            <div className="p-5 space-y-5">
              {donationsLoading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex flex-col gap-2">
                    <Skeleton className="h-4 w-full" />
                    <Skeleton className="h-3 w-1/3" />
                  </div>
                ))
              ) : recentDonations?.length === 0 ? (
                <div className="text-center text-muted-foreground py-4 text-sm">No activity yet</div>
              ) : (
                recentDonations?.map((donation) => (
                  <motion.div 
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    key={donation.id} 
                    className="flex flex-col gap-1 text-sm border-l-2 border-primary/30 pl-3 py-1"
                  >
                    <div>
                      <span className="font-mono text-primary font-medium">{truncateAddress(donation.donorAddress)}</span>
                      <span className="text-muted-foreground mx-1">funded</span>
                      <Link href={`/project/${donation.projectId}`} className="font-medium hover:text-primary transition-colors">
                        {donation.projectName}
                      </Link>
                    </div>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="font-mono font-medium text-foreground">{formatWeiToEth(donation.amountWei)} ETH</span>
                      <span>{formatDistanceToNow(new Date(donation.createdAt), { addSuffix: true })}</span>
                    </div>
                  </motion.div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </Layout>
  );
}