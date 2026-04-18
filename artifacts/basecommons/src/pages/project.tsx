import { Layout } from "@/components/layout";
import { useParams } from "wouter";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { 
  useGetProject, 
  useListProjectDonations,
  useRecordDonation,
  useGetPlatformStats,
  getGetProjectQueryKey,
  getListProjectDonationsQueryKey,
  getGetPlatformStatsQueryKey
} from "@workspace/api-client-react";
import { formatWeiToEth, parseEthToWei, truncateAddress, estimateMatchIncrease } from "@/lib/web3";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { format } from "date-fns";
import { ExternalLink, Globe, Leaf, Users, ArrowUpRight } from "lucide-react";
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

const donateSchema = z.object({
  amountEth: z.string().refine(val => !isNaN(Number(val)) && Number(val) > 0, "Amount must be greater than 0"),
});

export default function ProjectDetail() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [walletConnected, setWalletConnected] = useState(false);
  const [simulatedAddress] = useState(`0x${Math.random().toString(16).slice(2, 42)}`);

  const { data: project, isLoading: projectLoading } = useGetProject(id || "", {
    query: { enabled: !!id, queryKey: getGetProjectQueryKey(id || "") }
  });

  const { data: donations, isLoading: donationsLoading } = useListProjectDonations(id || "", {
    query: { enabled: !!id, queryKey: getListProjectDonationsQueryKey(id || "") }
  });

  const { data: stats } = useGetPlatformStats({
    query: { queryKey: getGetPlatformStatsQueryKey() }
  });

  const recordDonation = useRecordDonation();

  const form = useForm<z.infer<typeof donateSchema>>({
    resolver: zodResolver(donateSchema),
    defaultValues: {
      amountEth: "0.01",
    },
  });

  const watchAmount = form.watch("amountEth");

  const onSubmit = async (values: z.infer<typeof donateSchema>) => {
    if (!id || !project || !stats) return;

    try {
      const amountWei = parseEthToWei(values.amountEth);
      
      await recordDonation.mutateAsync({
        id,
        data: {
          donorAddress: simulatedAddress,
          amountWei,
          cycleId: stats.currentCycleId,
          txHash: `0x${Math.random().toString(16).slice(2, 66)}` // fake hash
        }
      });

      toast({
        title: "Donation Successful!",
        description: `You funded ${project.name} with ${values.amountEth} ETH.`,
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: getGetProjectQueryKey(id) });
      queryClient.invalidateQueries({ queryKey: getListProjectDonationsQueryKey(id) });
      form.reset({ amountEth: "" });
    } catch (error) {
      toast({
        title: "Donation Failed",
        description: "Something went wrong recording the donation.",
        variant: "destructive"
      });
    }
  };

  const setPreset = (val: string) => {
    form.setValue("amountEth", val, { shouldValidate: true });
  };

  if (projectLoading) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-12 max-w-5xl">
          <Skeleton className="w-full h-64 md:h-96 rounded-2xl mb-8" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="md:col-span-2 space-y-4">
              <Skeleton className="h-12 w-3/4" />
              <Skeleton className="h-6 w-full" />
              <Skeleton className="h-6 w-5/6" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-64 w-full" />
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  if (!project) {
    return (
      <Layout>
        <div className="container mx-auto px-4 py-24 text-center">
          <h1 className="text-2xl font-bold">Project not found</h1>
        </div>
      </Layout>
    );
  }

  const estimatedIncreaseWei = (watchAmount && project && stats && !isNaN(Number(watchAmount))) 
    ? estimateMatchIncrease(
        project.totalDonationsWei, 
        parseEthToWei(watchAmount), 
        stats.matchingPoolWei, 
        stats.totalDonationsWei
      )
    : "0";

  return (
    <Layout>
      <div className="container mx-auto px-4 py-8 md:py-12 max-w-5xl">
        {/* Header Image */}
        <div className="relative w-full h-64 md:h-[400px] rounded-2xl overflow-hidden mb-8 shadow-md">
          <img 
            src={project.imageUrl || projectImages[project.name] || gardenImg} 
            alt={project.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex flex-col justify-end p-8">
            <div className="inline-flex w-fit items-center gap-2 px-3 py-1 rounded-full bg-primary text-primary-foreground font-medium text-xs mb-3 shadow-sm">
              {project.category || "Public Good"}
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground mb-2 drop-shadow-md">{project.name}</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-10">
            <section>
              <h2 className="text-2xl font-bold mb-4">About the Project</h2>
              <div className="prose prose-lg dark:prose-invert max-w-none text-muted-foreground font-serif leading-relaxed">
                {project.description.split('\n').map((p, i) => (
                  <p key={i} className="mb-4">{p}</p>
                ))}
              </div>
            </section>

            <div className="flex flex-wrap gap-4 pt-4 border-t border-border/50">
              {project.website && (
                <a href={project.website} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <Globe size={16} /> Website
                </a>
              )}
              {project.twitterHandle && (
                <a href={`https://twitter.com/${project.twitterHandle.replace('@', '')}`} target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-primary transition-colors">
                  <ExternalLink size={16} /> {project.twitterHandle}
                </a>
              )}
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground font-mono">
                Recipient: {truncateAddress(project.recipientAddress)}
              </div>
            </div>

            <section className="pt-8">
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                <Users className="text-primary" /> Supporters ({project.donorCount})
              </h2>
              <div className="space-y-4">
                {donationsLoading ? (
                  <Skeleton className="h-20 w-full" />
                ) : donations?.length === 0 ? (
                  <div className="p-6 text-center border border-dashed border-border rounded-xl bg-muted/20 text-muted-foreground">
                    Be the first to fund this project!
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {donations?.map(d => (
                      <div key={d.id} className="flex items-center justify-between p-4 rounded-xl border border-border bg-card shadow-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                            {d.donorAddress.slice(2, 4)}
                          </div>
                          <div>
                            <div className="font-mono text-sm font-medium">{truncateAddress(d.donorAddress)}</div>
                            <div className="text-xs text-muted-foreground">{format(new Date(d.createdAt), "MMM d, yyyy")}</div>
                          </div>
                        </div>
                        <div className="font-mono font-bold text-foreground">
                          {formatWeiToEth(d.amountWei)} ETH
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </section>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Stats Card */}
            <Card className="bg-card border-border shadow-md">
              <CardContent className="p-6">
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div>
                    <div className="text-sm text-muted-foreground font-medium mb-1">Raised</div>
                    <div className="text-2xl font-bold font-mono">{formatWeiToEth(project.totalDonationsWei)} <span className="text-sm font-sans text-muted-foreground">ETH</span></div>
                  </div>
                  <div>
                    <div className="text-sm text-muted-foreground font-medium mb-1">Donors</div>
                    <div className="text-2xl font-bold">{project.donorCount}</div>
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-secondary/10 border border-secondary/20">
                  <div className="text-sm text-secondary font-semibold uppercase tracking-wider mb-1 flex items-center gap-1">
                    <Leaf size={14} /> Current Match Estimate
                  </div>
                  <div className="text-3xl font-bold font-mono text-foreground">
                    +{formatWeiToEth(project.estimatedMatchWei)} <span className="text-sm font-sans text-muted-foreground">ETH</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Donate Box */}
            <Card className="bg-card border-border shadow-md sticky top-24">
              <CardHeader className="bg-muted/30 border-b border-border/50 pb-4">
                <CardTitle>Fund this project</CardTitle>
                <CardDescription>Your contribution will be matched quadratically.</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <FormField
                      control={form.control}
                      name="amountEth"
                      render={({ field }) => (
                        <FormItem>
                          <div className="flex justify-between mb-2">
                            <label className="text-sm font-medium">Amount (ETH)</label>
                          </div>
                          <FormControl>
                            <div className="relative">
                              <Input 
                                placeholder="0.01" 
                                {...field} 
                                className="font-mono text-lg py-6 pl-4 pr-16 bg-background"
                              />
                              <div className="absolute right-4 top-1/2 -translate-y-1/2 font-bold text-muted-foreground">
                                ETH
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex flex-wrap gap-2">
                      {["0.001", "0.005", "0.01", "0.05"].map(amt => (
                        <button
                          key={amt}
                          type="button"
                          onClick={() => setPreset(amt)}
                          className="px-3 py-1.5 rounded-md border border-border bg-background text-sm font-mono hover:border-primary hover:text-primary transition-colors focus:outline-none focus:ring-2 focus:ring-primary/20"
                        >
                          {amt}
                        </button>
                      ))}
                    </div>

                    {/* QF Estimator Box */}
                    <div className="p-4 rounded-xl bg-card border border-border/50 shadow-inner relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-50"></div>
                      <div className="relative z-10">
                        <div className="text-sm font-medium text-muted-foreground mb-1">Estimated Match Impact</div>
                        <div className="flex items-baseline gap-2">
                          <span className="text-2xl font-bold font-mono text-primary transition-all">
                            +{formatWeiToEth(estimatedIncreaseWei)}
                          </span>
                          <span className="text-sm text-muted-foreground font-medium">ETH</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-2 flex items-center gap-1">
                          <ArrowUpRight size={12} className="text-primary"/>
                          Your donation unlocks more funding
                        </div>
                      </div>
                    </div>

                    {!walletConnected ? (
                      <div className="space-y-3">
                        <Button 
                          type="button" 
                          className="w-full py-6 text-lg font-bold rounded-full"
                          onClick={() => setWalletConnected(true)}
                        >
                          Connect Wallet
                        </Button>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <Button 
                          type="submit" 
                          className="w-full py-6 text-lg font-bold rounded-full bg-primary hover:bg-primary/90"
                          disabled={recordDonation.isPending}
                        >
                          {recordDonation.isPending ? "Confirming..." : "Confirm Donation"}
                        </Button>
                        
                        {/* Dev mode button since no real wallet */}
                        <div className="text-center mt-4 pt-4 border-t border-border/50">
                          <p className="text-xs text-muted-foreground mb-2">Dev Mode: Wallet Connected ({truncateAddress(simulatedAddress)})</p>
                          <Button 
                            type="button" 
                            variant="outline" 
                            size="sm"
                            className="w-full text-xs"
                            onClick={() => setWalletConnected(false)}
                          >
                            Disconnect
                          </Button>
                        </div>
                      </div>
                    )}
                  </form>
                </Form>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}