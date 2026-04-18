import { Layout } from "@/components/layout";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { Leaf, Users, TrendingUp, Shield, Zap, ArrowRight, Heart, Calculator } from "lucide-react";

const steps = [
  {
    step: "01",
    icon: <Leaf size={32} className="text-secondary" />,
    title: "Projects apply",
    desc: "Anyone building public goods — open source tools, community gardens, local music programs — registers their project with a description and wallet address.",
    color: "from-secondary/10 to-secondary/5",
    border: "border-secondary/20",
  },
  {
    step: "02",
    icon: <Heart size={32} className="text-primary" />,
    title: "Community donates",
    desc: "Supporters donate any amount of ETH to projects they believe in. Even 0.001 ETH matters — your support is counted in the QF formula.",
    color: "from-primary/10 to-primary/5",
    border: "border-primary/20",
  },
  {
    step: "03",
    icon: <Calculator size={32} className="text-amber-500" />,
    title: "QF algorithm runs",
    desc: "The quadratic formula calculates matching: (Σ√donations)². Projects with broad community support are amplified far more than single large donations.",
    color: "from-amber-500/10 to-amber-500/5",
    border: "border-amber-500/20",
  },
  {
    step: "04",
    icon: <TrendingUp size={32} className="text-secondary" />,
    title: "Matching distributed",
    desc: "At round's end, the matching pool is distributed proportionally. 9 people donating 0.01 ETH each outmatch 1 whale donating 0.5 ETH.",
    color: "from-secondary/10 to-secondary/5",
    border: "border-secondary/20",
  },
];

const examples = [
  {
    label: "Without QF",
    projectA: { donors: 1, perDonor: 1.0, total: 1.0 },
    projectB: { donors: 100, perDonor: 0.01, total: 1.0 },
    matchA: 50,
    matchB: 50,
    note: "Equal total donations = equal share (whale wins by default)",
    bad: true,
  },
  {
    label: "With QF",
    projectA: { donors: 1, perDonor: 1.0, total: 1.0 },
    projectB: { donors: 100, perDonor: 0.01, total: 1.0 },
    matchA: 9,
    matchB: 91,
    note: "QF rewards breadth: 100 small donors crush 1 whale",
    bad: false,
  },
];

const whyQF = [
  {
    icon: <Shield size={24} />,
    title: "Sybil-resistant by design",
    desc: "Additional unique donors increase QF scores, but splitting one donation across wallets doesn't help — diminishing returns prevent gaming.",
  },
  {
    icon: <Users size={24} />,
    title: "Democracy over plutocracy",
    desc: "Community breadth matters more than wallet depth. 100 people each caring a little outweigh 1 person caring a lot — how it should be.",
  },
  {
    icon: <Zap size={24} />,
    title: "Instant on-chain results",
    desc: "Every donation is recorded on Base L2. Gas fees are minimal (<$0.01) so everyone can participate, not just wealthy wallet holders.",
  },
  {
    icon: <TrendingUp size={24} />,
    title: "Provably fair",
    desc: "The QF algorithm is open source, auditable on Basescan, and mathematically provable. No black boxes, no admin discretion.",
  },
];

export default function HowItWorks() {
  return (
    <Layout>
      <div className="container mx-auto max-w-5xl px-4 py-20">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-secondary/10 text-secondary font-medium text-sm mb-6 border border-secondary/20">
            <Calculator size={14} />
            <span>Quadratic Funding Explained</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold tracking-tight mb-6">
            How BaseCommons<br />
            <span className="text-primary italic font-serif">works</span>
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Quadratic funding is a mathematically optimal mechanism for funding public goods.
            Here's how we use it to make sure community voice always beats whale capital.
          </p>
        </motion.div>

        {/* The Formula */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="mb-16"
        >
          <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-background overflow-hidden">
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">The Formula</h2>
              <div className="font-mono text-xl md:text-2xl bg-muted/50 rounded-xl px-6 py-4 inline-block mb-6 border border-border">
                match(project) = (Σᵢ √donationᵢ)² / Σⱼ (Σᵢ √donationᵢⱼ)² × pool
              </div>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                The square root function means each additional donor adds less than the previous one —
                but many small donors together create an outsized QF score compared to a single large donation.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* Steps */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {steps.map((step, i) => (
            <motion.div
              key={step.step}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
            >
              <Card className={`h-full border ${step.border} bg-gradient-to-br ${step.color}`}>
                <CardContent className="p-6">
                  <div className="flex items-start gap-4">
                    <div className="flex-shrink-0">{step.icon}</div>
                    <div>
                      <div className="text-xs font-bold text-muted-foreground uppercase tracking-widest mb-1">
                        Step {step.step}
                      </div>
                      <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* QF vs Normal Comparison */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">The Difference</h2>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Without QF */}
            <Card className="border-destructive/20 bg-destructive/5">
              <CardContent className="p-6">
                <div className="text-sm font-bold text-destructive uppercase tracking-widest mb-4">❌ Without QF</div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Project A (1 whale × 1.0 ETH)</span>
                    <span className="font-mono font-bold">50%</span>
                  </div>
                  <div className="bg-destructive/20 h-3 rounded-full">
                    <div className="bg-destructive h-3 rounded-full" style={{ width: "50%" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Project B (100 donors × 0.01 ETH)</span>
                    <span className="font-mono font-bold">50%</span>
                  </div>
                  <div className="bg-muted h-3 rounded-full">
                    <div className="bg-muted-foreground h-3 rounded-full" style={{ width: "50%" }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Equal total donations = equal share. A whale and 100 community members are treated the same.</p>
              </CardContent>
            </Card>

            {/* With QF */}
            <Card className="border-secondary/20 bg-secondary/5">
              <CardContent className="p-6">
                <div className="text-sm font-bold text-secondary uppercase tracking-widest mb-4">✅ With Quadratic Funding</div>
                <div className="space-y-3 mb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Project A (1 whale × 1.0 ETH)</span>
                    <span className="font-mono font-bold">~9%</span>
                  </div>
                  <div className="bg-muted h-3 rounded-full">
                    <div className="bg-muted-foreground h-3 rounded-full" style={{ width: "9%" }} />
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Project B (100 donors × 0.01 ETH)</span>
                    <span className="font-mono font-bold text-secondary">~91%</span>
                  </div>
                  <div className="bg-secondary/20 h-3 rounded-full">
                    <div className="bg-secondary h-3 rounded-full" style={{ width: "91%" }} />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground">Community breadth wins. 100 people caring a little outweigh 1 whale caring a lot.</p>
              </CardContent>
            </Card>
          </div>

          <div className="text-center mt-4">
            <p className="text-xs text-muted-foreground italic">
              Math: QF_score = (Σ√d)²  →  A: (√1)² = 1,  B: (100×√0.01)² = (100×0.1)² = 100
            </p>
          </div>
        </motion.div>

        {/* Why QF */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <h2 className="text-3xl font-bold text-center mb-8">Why Quadratic Funding?</h2>
          <div className="grid sm:grid-cols-2 gap-4">
            {whyQF.map((item, i) => (
              <Card key={i} className="border-border/50 bg-card hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="text-primary mb-3">{item.icon}</div>
                  <h3 className="font-bold mb-2">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.desc}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </motion.div>

        {/* Reference */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16"
        >
          <Card className="border-border/50 bg-muted/20">
            <CardContent className="p-6">
              <h3 className="font-bold text-lg mb-3">📄 Original Research</h3>
              <p className="text-sm text-muted-foreground mb-3">
                Quadratic Funding was formalized by <strong>Vitalik Buterin</strong>, <strong>Zoë Hitzig</strong>, and <strong>E. Glen Weyl</strong> in their 2019 paper:
              </p>
              <a
                href="https://papers.ssrn.com/sol3/papers.cfm?abstract_id=3243656"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline text-sm font-medium"
              >
                "A Radical Market in Votes" (2019) → Liberal Radicalism: A Flexible Design for Philanthropic Matching Funds
              </a>
              <p className="text-sm text-muted-foreground mt-3">
                Gitcoin pioneered using QF for public goods funding, distributing over $60M across thousands of projects.
                BaseCommons brings this mechanism on-chain to Base with transparent, trustless execution.
              </p>
            </CardContent>
          </Card>
        </motion.div>

        {/* CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="text-center"
        >
          <h2 className="text-3xl font-bold mb-4">Ready to fund the commons?</h2>
          <p className="text-muted-foreground mb-8">Every donation — no matter how small — makes a difference through the power of QF.</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="rounded-full px-8" asChild>
              <Link href="/">Explore Projects <ArrowRight size={16} className="ml-2" /></Link>
            </Button>
            <Button size="lg" variant="outline" className="rounded-full px-8" asChild>
              <Link href="/create">Submit Your Project</Link>
            </Button>
          </div>
        </motion.div>
      </div>
    </Layout>
  );
}
