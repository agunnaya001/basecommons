import { Layout } from "@/components/layout";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useCreateProject, getListProjectsQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Info } from "lucide-react";

const projectSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(20, "Please provide a detailed description (min 20 chars)"),
  category: z.string().min(1, "Please select a category"),
  imageUrl: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  website: z.string().url("Must be a valid URL").or(z.literal("")).optional(),
  twitterHandle: z.string().optional(),
  recipientAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/, "Must be a valid ETH address"),
});

export default function CreateProject() {
  const createProject = useCreateProject();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<z.infer<typeof projectSchema>>({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      name: "",
      description: "",
      category: "",
      imageUrl: "",
      website: "",
      twitterHandle: "",
      recipientAddress: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof projectSchema>) => {
    try {
      const res = await createProject.mutateAsync({
        data: values
      });

      toast({
        title: "Project Registered",
        description: "Your project has been successfully added to the platform.",
      });

      queryClient.invalidateQueries({ queryKey: getListProjectsQueryKey() });
      setLocation(`/project/${res.id}`);
    } catch (error) {
      toast({
        title: "Registration Failed",
        description: "There was an error creating your project.",
        variant: "destructive"
      });
    }
  };

  return (
    <Layout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold tracking-tight mb-4">Submit a Project</h1>
          <p className="text-muted-foreground text-lg">
            Join the commons. Register your public good to receive matching funds in the current cycle.
          </p>
        </div>

        <Card className="bg-card border-border shadow-lg">
          <CardHeader className="bg-muted/30 border-b border-border/50">
            <CardTitle>Project Details</CardTitle>
            <CardDescription>All fields are stored off-chain except the recipient address which is required for the smart contract.</CardDescription>
          </CardHeader>
          <CardContent className="p-8">
            <div className="bg-primary/10 border border-primary/20 text-primary-foreground rounded-lg p-4 mb-8 flex gap-3 text-sm">
              <Info className="text-primary shrink-0" size={20} />
              <p className="text-foreground">
                <strong className="text-primary">Note on On-Chain Registration:</strong> In a full implementation, this form would trigger a wallet transaction to register the project on the Base blockchain registry contract before saving metadata. For this demo, we simulate the process.
              </p>
            </div>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">Project Name</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g. BaseCommons Protocol" className="py-6" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-base font-bold">Description</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the public good you are building..." 
                          className="min-h-[150px] resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="category"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-bold">Category</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="py-6">
                              <SelectValue placeholder="Select a category" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Open Source">Open Source</SelectItem>
                            <SelectItem value="Community">Community</SelectItem>
                            <SelectItem value="Education">Education</SelectItem>
                            <SelectItem value="Environment">Environment</SelectItem>
                            <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="recipientAddress"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-base font-bold">Recipient Address (Base)</FormLabel>
                        <FormControl>
                          <Input placeholder="0x..." className="py-6 font-mono" {...field} />
                        </FormControl>
                        <FormDescription>Where funds will be sent</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border/50">
                  <FormField
                    control={form.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Website URL</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="twitterHandle"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="font-bold">Twitter Handle</FormLabel>
                        <FormControl>
                          <Input placeholder="@" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="imageUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="font-bold">Cover Image URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://.../image.png" {...field} />
                      </FormControl>
                      <FormDescription>Optional. Leave blank to use a default image.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  className="w-full py-6 text-lg font-bold rounded-full mt-8 bg-primary hover:bg-primary/90"
                  disabled={createProject.isPending}
                >
                  {createProject.isPending ? "Registering..." : "Register Project"}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </Layout>
  );
}