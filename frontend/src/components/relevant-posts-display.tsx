"use client";

import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ExternalLink, MessageCircle, Twitter, Newspaper } from 'lucide-react'; // Using MessageCircle for generic, Twitter for Twitter, Newspaper for News
import type { RelevantPost, RelevantPostsData } from '@/types/analysis';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface RelevantPostsDisplayProps {
  data?: RelevantPostsData;
}

const PlatformIcon = ({ platform }: { platform: string }) => {
  const lowerPlatform = platform.toLowerCase();
  if (lowerPlatform.includes('twitter')) {
    return <Twitter className="h-4 w-4 text-blue-500" />;
  }
  if (lowerPlatform.includes('reddit')) {
    // Lucide doesn't have a direct Reddit icon, use a generic one or find an SVG
    return <MessageCircle className="h-4 w-4 text-orange-500" />;
  }
  if (lowerPlatform.includes('news')) {
    return <Newspaper className="h-4 w-4 text-gray-500" />;
  }
  return <MessageCircle className="h-4 w-4 text-muted-foreground" />;
};

const PostItem: React.FC<{ post: RelevantPost }> = ({ post }) => {
  return (
    <Card className="mb-4 shadow-sm hover:shadow-md transition-shadow duration-200">
      <CardHeader className="pb-2 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <PlatformIcon platform={post.platform} />
            <CardTitle className="text-sm font-medium text-muted-foreground">{post.platform}</CardTitle>
          </div>
          <span className="text-xs text-muted-foreground">{new Date(post.date).toLocaleDateString()}</span>
        </div>
      </CardHeader>
      <CardContent className="pb-3">
        <p className="text-sm text-foreground leading-relaxed">{post.text}</p>
      </CardContent>
      <CardFooter className="pt-0 pb-3 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Badge 
            variant="outline" 
            className={cn(
              "text-xs",
              post.sentiment === "positive" && "text-green-500 border-green-500/20",
              post.sentiment === "negative" && "text-red-500 border-red-500/20",
              post.sentiment === "neutral" && "text-gray-500 border-gray-500/20"
            )}
          >
            {post.sentiment.charAt(0).toUpperCase() + post.sentiment.slice(1)}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Score: {post.score}
          </Badge>
        </div>
        <a
          href={post.link}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs text-primary hover:underline flex items-center gap-1"
        >
          View Post <ExternalLink className="h-3 w-3" />
        </a>
      </CardFooter>
    </Card>
  );
};

const PostsList: React.FC<{ posts: RelevantPost[]; sentimentLabel: string }> = ({ posts, sentimentLabel }) => {
  if (!posts || posts.length === 0) {
    return <p className="text-muted-foreground text-center py-8">No {sentimentLabel.toLowerCase()} posts found.</p>;
  }
  return (
    <ScrollArea className="h-[400px] pr-3"> {/* Added pr-3 for scrollbar spacing */}
      {posts.map((post, index) => (
        <PostItem key={`${post.link}-${index}`} post={post} />
      ))}
    </ScrollArea>
  );
};

export function RelevantPostsDisplay({ data }: RelevantPostsDisplayProps) {
  if (!data || (!data.positive?.length && !data.negative?.length && !data.neutral?.length)) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Top Relevant Posts</CardTitle>
          <CardDescription>Highlights of positive, negative, and neutral mentions.</CardDescription>
        </CardHeader>
        <CardContent className="h-[300px] flex items-center justify-center">
          <p className="text-muted-foreground">No relevant post data available for display.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Relevant Posts</CardTitle>
        <CardDescription>Highlights of positive, negative, and neutral mentions from various platforms.</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="positive" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger 
              value="positive" 
              className="data-[state=active]:bg-green-500/20 data-[state=active]:text-green-500 data-[state=active]:shadow-sm"
            >
              Positive ({data.positive?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="negative" 
              className="data-[state=active]:bg-red-500/20 data-[state=active]:text-red-500 data-[state=active]:shadow-sm"
            >
              Negative ({data.negative?.length || 0})
            </TabsTrigger>
            <TabsTrigger 
              value="neutral" 
              className="data-[state=active]:bg-gray-500/20 data-[state=active]:text-gray-500 data-[state=active]:shadow-sm"
            >
              Neutral ({data.neutral?.length || 0})
            </TabsTrigger>
          </TabsList>
          <TabsContent value="positive">
            <PostsList posts={data.positive} sentimentLabel="Positive" />
          </TabsContent>
          <TabsContent value="negative">
            <PostsList posts={data.negative} sentimentLabel="Negative" />
          </TabsContent>
          <TabsContent value="neutral">
            <PostsList posts={data.neutral} sentimentLabel="Neutral" />
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
