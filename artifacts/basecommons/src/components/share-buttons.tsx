import { Twitter, Link2, Share2 } from "lucide-react";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";

interface ShareButtonsProps {
  projectName: string;
  projectId: number;
  totalDonationsEth: string;
  matchEstimateEth: string;
}

export function ShareButtons({ projectName, projectId, totalDonationsEth, matchEstimateEth }: ShareButtonsProps) {
  const { toast } = useToast();

  const getUrl = () => {
    const base = window.location.origin + window.location.pathname.replace(/\/project\/\d+.*/, "");
    return `${base}/project/${projectId}`;
  };

  const tweetText = () => {
    return encodeURIComponent(
      `I just supported "${projectName}" on BaseCommons! 🌱\n\n` +
      `💚 ${totalDonationsEth} ETH raised from the community\n` +
      `📈 Estimated +${matchEstimateEth} ETH QF match\n\n` +
      `Your small donation is amplified through quadratic funding on Base. Join me!\n` +
      `${getUrl()}\n\n` +
      `#BaseCommons #QuadraticFunding #Base #PublicGoods`
    );
  };

  const farcasterText = () => {
    return encodeURIComponent(
      `Supporting "${projectName}" on @BaseCommons! 🌱\n\n` +
      `${totalDonationsEth} ETH raised, ${matchEstimateEth} ETH est. QF match.\n` +
      `Quadratic funding rewards community breadth over whale depth.\n` +
      `${getUrl()}`
    );
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(getUrl());
      toast({
        title: "Link copied!",
        description: "Share it with your community to boost the QF match.",
        duration: 2500,
      });
    } catch {
      toast({ title: "Copy failed", description: "Please copy the URL manually.", variant: "destructive" });
    }
  };

  const shareNative = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Support ${projectName} on BaseCommons`,
          text: `I supported "${projectName}" on BaseCommons. Your small donation is amplified through QF on Base!`,
          url: getUrl(),
        });
      } catch {
        // user cancelled
      }
    } else {
      copyLink();
    }
  };

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground font-medium">
        📣 Share to boost the QF match — more donors = more matching funds!
      </p>
      <div className="flex flex-wrap gap-2">
        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-[#1DA1F2] border-[#1DA1F2]/30 hover:bg-[#1DA1F2]/10"
          onClick={() => window.open(`https://twitter.com/intent/tweet?text=${tweetText()}`, "_blank")}
        >
          <Twitter size={15} />
          Share on X
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-2 text-purple-500 border-purple-500/30 hover:bg-purple-500/10"
          onClick={() => window.open(`https://warpcast.com/~/compose?text=${farcasterText()}`, "_blank")}
        >
          <svg width="15" height="15" viewBox="0 0 1000 1000" fill="currentColor">
            <path d="M257.778 155.556H742.222V844.444H671.111V528.889H670.414C662.554 441.677 589.258 373.333 500 373.333C410.742 373.333 337.446 441.677 329.586 528.889H328.889V844.444H257.778V155.556Z"/>
            <path d="M128.889 253.333L157.778 351.111H182.222V746.667C169.949 746.667 160 756.616 160 768.889V795.556H155.556C143.283 795.556 133.333 805.505 133.333 817.778V844.444H382.222V817.778C382.222 805.505 372.273 795.556 360 795.556H355.556V768.889C355.556 756.616 345.606 746.667 333.333 746.667H306.667V253.333H128.889Z"/>
            <path d="M693.333 746.667C681.061 746.667 671.111 756.616 671.111 768.889V795.556H666.667C654.394 795.556 644.444 805.505 644.444 817.778V844.444H893.333V817.778C893.333 805.505 883.384 795.556 871.111 795.556H866.667V768.889C866.667 756.616 856.717 746.667 844.444 746.667V351.111H868.889L897.778 253.333H720V746.667H693.333Z"/>
          </svg>
          Cast on Farcaster
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-2"
          onClick={copyLink}
        >
          <Link2 size={15} />
          Copy link
        </Button>

        <Button
          size="sm"
          variant="outline"
          className="gap-2 md:hidden"
          onClick={shareNative}
        >
          <Share2 size={15} />
          Share
        </Button>
      </div>
    </div>
  );
}
