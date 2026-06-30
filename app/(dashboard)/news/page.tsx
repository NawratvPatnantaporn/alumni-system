"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import Swal from "sweetalert2";
import {
  Calendar,
  Eye,
  Filter,
  Heart,
  Loader2,
  MessageCircle,
  Newspaper,
  Search,
  Send,
} from "lucide-react";

import { supabase } from "@/lib/supabase/client";
import { useAuth } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type NewsItem = {
  id: string;
  title: string;
  excerpt: string | null;
  content: string | null;
  category: string | null;
  cover_image_url: string | null;
  is_featured: boolean;
  is_published: boolean;
  views_count: number;
  likes_count: number;
  comments_count: number;
  created_at: string;
  updated_at: string | null;
  is_liked: boolean;
};

type NewsComment = {
  id: string;
  news_post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  authorName: string;
  authorAvatar: string | null;
  authorRole: string | null;
};

function formatThaiDate(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

function formatThaiDateTime(value?: string | null) {
  if (!value) return "-";

  return new Date(value).toLocaleString("th-TH", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function NewsPage() {
  const { user } = useAuth();

  const [loading, setLoading] = useState(true);
  const [newsList, setNewsList] = useState<NewsItem[]>([]);
  const [selectedNews, setSelectedNews] = useState<NewsItem | null>(null);

  const [comments, setComments] = useState<NewsComment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentLoading, setCommentLoading] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");

  const categories = useMemo(() => {
    const values = newsList
      .map((item) => item.category)
      .filter(Boolean) as string[];

    return Array.from(new Set(values));
  }, [newsList]);

  const featuredNews = useMemo(() => {
    return newsList.filter((item) => item.is_featured).slice(0, 2);
  }, [newsList]);

  const filteredNews = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();

    return newsList.filter((item) => {
      const matchesSearch =
        !keyword ||
        item.title.toLowerCase().includes(keyword) ||
        (item.excerpt ?? "").toLowerCase().includes(keyword) ||
        (item.content ?? "").toLowerCase().includes(keyword);

      const matchesCategory =
        categoryFilter === "all" || item.category === categoryFilter;

      return matchesSearch && matchesCategory;
    });
  }, [newsList, searchQuery, categoryFilter]);

  const normalNews = useMemo(() => {
    return filteredNews.filter((item) => !item.is_featured);
  }, [filteredNews]);

  const updateNewsLocal = (newsId: string, patch: Partial<NewsItem>) => {
    setNewsList((prev) =>
      prev.map((item) => (item.id === newsId ? { ...item, ...patch } : item)),
    );

    setSelectedNews((prev) =>
      prev && prev.id === newsId ? { ...prev, ...patch } : prev,
    );
  };

  const loadNews = async () => {
    try {
      setLoading(true);

      const { data, error } = await supabase
        .from("news_posts")
        .select(
          `
        id,
        title,
        excerpt,
        content,
        category,
        cover_image_url,
        is_featured,
        is_published,
        views_count,
        likes_count,
        comments_count,
        created_at,
        updated_at
      `,
        )
        .eq("is_published", true)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const newsIds = (data ?? []).map((item: any) => item.id);

      let likedSet = new Set<string>();
      const likeCountMap = new Map<string, number>();
      const commentCountMap = new Map<string, number>();

      if (newsIds.length > 0) {
        const [{ data: likeRows }, { data: commentRows }] = await Promise.all([
          supabase
            .from("news_post_likes")
            .select("news_post_id")
            .in("news_post_id", newsIds),

          supabase
            .from("news_post_comments")
            .select("news_post_id")
            .in("news_post_id", newsIds),
        ]);

        (likeRows ?? []).forEach((row: any) => {
          likeCountMap.set(
            row.news_post_id,
            (likeCountMap.get(row.news_post_id) ?? 0) + 1,
          );
        });

        (commentRows ?? []).forEach((row: any) => {
          commentCountMap.set(
            row.news_post_id,
            (commentCountMap.get(row.news_post_id) ?? 0) + 1,
          );
        });
      }

      if (user?.id && newsIds.length > 0) {
        const { data: likedRows, error: likeError } = await supabase
          .from("news_post_likes")
          .select("news_post_id")
          .eq("user_id", user.id)
          .in("news_post_id", newsIds);

        if (likeError) throw likeError;

        likedSet = new Set(
          (likedRows ?? []).map((item: any) => item.news_post_id),
        );
      }

      const mappedNews = (data ?? []).map(
        (item: any): NewsItem => ({
          id: item.id,
          title: item.title ?? "",
          excerpt: item.excerpt ?? null,
          content: item.content ?? null,
          category: item.category ?? null,
          cover_image_url: item.cover_image_url ?? null,
          is_featured: item.is_featured ?? false,
          is_published: item.is_published ?? false,
          views_count: item.views_count ?? 0,
          likes_count: likeCountMap.get(item.id) ?? item.likes_count ?? 0,
          comments_count:
            commentCountMap.get(item.id) ?? item.comments_count ?? 0,
          created_at: item.created_at,
          updated_at: item.updated_at ?? null,
          is_liked: likedSet.has(item.id),
        }),
      );

      setNewsList(mappedNews);
    } catch (error) {
      console.error("LOAD NEWS ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "โหลดข่าวสารไม่สำเร็จ",
        text: "ตรวจสอบชื่อ column หรือ RLS policy ใน Supabase",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setLoading(false);
    }
  };

  const loadNewsComments = async (newsId: string) => {
    try {
      setCommentLoading(true);

      const { data, error } = await supabase
        .from("news_post_comments")
        .select("id, news_post_id, user_id, content, created_at")
        .eq("news_post_id", newsId)
        .order("created_at", { ascending: false });

      if (error) throw error;

      const userIds = Array.from(
        new Set((data ?? []).map((item: any) => item.user_id)),
      );

      const profileMap = new Map<
        string,
        { name: string; avatar: string | null; role: string | null }
      >();

      if (userIds.length > 0) {
        const { data: profiles } = await supabase
          .from("profiles")
          .select("id, first_name, last_name, email, avatar_url, role")
          .in("id", userIds);

        (profiles ?? []).forEach((profile: any) => {
          const name =
            [profile.first_name, profile.last_name].filter(Boolean).join(" ") ||
            profile.email ||
            "ผู้ใช้";

          profileMap.set(profile.id, {
            name,
            avatar: profile.avatar_url ?? null,
            role: profile.role ?? null,
          });
        });
      }

      setComments(
        (data ?? []).map((item: any): NewsComment => {
          const profile = profileMap.get(item.user_id);

          return {
            id: item.id,
            news_post_id: item.news_post_id,
            user_id: item.user_id,
            content: item.content,
            created_at: item.created_at,
            authorName: profile?.name ?? "ผู้ใช้",
            authorAvatar: profile?.avatar ?? null,
            authorRole: profile?.role ?? null,
          };
        }),
      );
    } catch (error) {
      console.error("LOAD NEWS COMMENTS ERROR:", error);
    } finally {
      setCommentLoading(false);
    }
  };

  const openNewsDetail = async (news: NewsItem) => {
    setSelectedNews(news);
    setComments([]);
    setCommentText("");

    await loadNewsComments(news.id);

    const { error } = await supabase.rpc("increment_news_view", {
      news_id_input: news.id,
    });

    if (error) {
      console.error(
        "INCREMENT NEWS VIEW ERROR:",
        error.message,
        error.details,
        error.hint,
        error,
      );
      return;
    }

    updateNewsLocal(news.id, {
      views_count: news.views_count + 1,
    });
  };

  const toggleLikeNews = async (news: NewsItem) => {
    if (!user?.id) {
      Swal.fire({
        icon: "warning",
        title: "กรุณาเข้าสู่ระบบ",
        text: "ต้องเข้าสู่ระบบก่อนกดถูกใจ",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    try {
      if (news.is_liked) {
        const { error } = await supabase
          .from("news_post_likes")
          .delete()
          .eq("news_post_id", news.id)
          .eq("user_id", user.id);

        if (error) throw error;

        updateNewsLocal(news.id, {
          is_liked: false,
          likes_count: Math.max(0, news.likes_count - 1),
        });
      } else {
        const { error } = await supabase.from("news_post_likes").insert({
          news_post_id: news.id,
          user_id: user.id,
        });

        if (error && error.code !== "23505") throw error;

        updateNewsLocal(news.id, {
          is_liked: true,
          likes_count: news.likes_count + 1,
        });
      }
    } catch (error) {
      console.error("TOGGLE NEWS LIKE ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "ดำเนินการไม่สำเร็จ",
        text: "ไม่สามารถกดถูกใจได้",
        confirmButtonText: "ตกลง",
      });
    }
  };

  const submitComment = async () => {
    if (!user?.id || !selectedNews) return;

    const content = commentText.trim();

    if (!content) {
      Swal.fire({
        icon: "warning",
        title: "กรุณากรอกความคิดเห็น",
        confirmButtonText: "ตกลง",
      });
      return;
    }

    try {
      setCommentLoading(true);

      const { error } = await supabase.from("news_post_comments").insert({
        news_post_id: selectedNews.id,
        user_id: user.id,
        content,
      });

      if (error) throw error;

      setCommentText("");
      await loadNewsComments(selectedNews.id);

      updateNewsLocal(selectedNews.id, {
        comments_count: selectedNews.comments_count + 1,
      });

      Swal.fire({
        icon: "success",
        title: "ส่งความคิดเห็นแล้ว",
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 1500,
      });
    } catch (error) {
      console.error("SUBMIT COMMENT ERROR:", error);
      Swal.fire({
        icon: "error",
        title: "ส่งความคิดเห็นไม่สำเร็จ",
        confirmButtonText: "ตกลง",
      });
    } finally {
      setCommentLoading(false);
    }
  };

  useEffect(() => {
    loadNews();
  }, [user?.id]);

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-3">
          <Newspaper className="w-8 h-8 text-primary" />
          <h1 className="text-3xl font-bold">ข่าวสารและประกาศ</h1>
        </div>
        <p className="text-muted-foreground mt-1">
          ติดตามข่าวสารล่าสุดจากสมาคมศิษย์เก่า
        </p>
      </div>

      <Card>
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ค้นหาข่าวสาร..."
                className="pl-10"
              />
            </div>

            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-full md:w-48">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="หมวดหมู่" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">ทั้งหมด</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {loading ? (
        <div className="flex items-center justify-center py-20 text-muted-foreground">
          <Loader2 className="w-5 h-5 mr-2 animate-spin" />
          กำลังโหลดข่าวสาร...
        </div>
      ) : (
        <>
          {featuredNews.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold">ข่าวเด่น</h2>

              <div className="grid md:grid-cols-2 gap-6">
                {featuredNews.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    featured
                    onOpen={() => openNewsDetail(news)}
                    onLike={() => toggleLikeNews(news)}
                  />
                ))}
              </div>
            </section>
          )}

          <section className="space-y-4">
            <h2 className="text-xl font-semibold">
              ข่าวสารทั้งหมด ({filteredNews.length})
            </h2>

            {normalNews.length === 0 ? (
              <Card>
                <CardContent className="p-10 text-center text-muted-foreground">
                  ไม่พบข่าวสาร
                </CardContent>
              </Card>
            ) : (
              <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {normalNews.map((news) => (
                  <NewsCard
                    key={news.id}
                    news={news}
                    onOpen={() => openNewsDetail(news)}
                    onLike={() => toggleLikeNews(news)}
                  />
                ))}
              </div>
            )}
          </section>
        </>
      )}

      <Dialog
        open={!!selectedNews}
        onOpenChange={(open) => {
          if (!open) {
            setSelectedNews(null);
            setComments([]);
            setCommentText("");
          }
        }}
      >
        <DialogContent className="w-[95vw] sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {selectedNews?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedNews?.category || "ข่าวสาร"} •{" "}
              {formatThaiDate(selectedNews?.created_at)}
            </DialogDescription>
          </DialogHeader>

          {selectedNews && (
            <div className="space-y-5">
              {selectedNews.cover_image_url && (
                <img
                  src={selectedNews.cover_image_url}
                  alt={selectedNews.title}
                  className="w-full max-h-[380px] object-cover rounded-2xl border"
                />
              )}

              <div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Eye className="w-4 h-4" />
                  {selectedNews.views_count.toLocaleString("th-TH")}
                </span>

                <button
                  type="button"
                  onClick={() => toggleLikeNews(selectedNews)}
                  className={[
                    "flex items-center gap-1 transition",
                    selectedNews.is_liked
                      ? "text-red-600"
                      : "hover:text-red-600",
                  ].join(" ")}
                >
                  <Heart
                    className="w-4 h-4"
                    fill={selectedNews.is_liked ? "currentColor" : "none"}
                  />
                  {selectedNews.likes_count.toLocaleString("th-TH")}
                </button>

                <span className="flex items-center gap-1">
                  <MessageCircle className="w-4 h-4" />
                  {selectedNews.comments_count.toLocaleString("th-TH")}
                </span>
              </div>

              {selectedNews.excerpt && (
                <div className="rounded-2xl bg-muted/40 p-4 text-sm leading-7">
                  {selectedNews.excerpt}
                </div>
              )}

              <div className="whitespace-pre-line text-sm leading-8 text-muted-foreground">
                {selectedNews.content || "ไม่มีรายละเอียดเพิ่มเติม"}
              </div>

              <div className="border-t pt-5 space-y-4">
                <div className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  <h3 className="font-semibold">ความคิดเห็น</h3>
                </div>

                <div className="space-y-3">
                  <Textarea
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    placeholder="แสดงความคิดเห็น..."
                    className="min-h-24"
                  />

                  <div className="flex justify-end">
                    <Button onClick={submitComment} disabled={commentLoading}>
                      {commentLoading ? (
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4 mr-2" />
                      )}
                      ส่งความคิดเห็น
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  {commentLoading && comments.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      กำลังโหลดความคิดเห็น...
                    </div>
                  ) : comments.length === 0 ? (
                    <div className="py-6 text-center text-muted-foreground">
                      ยังไม่มีความคิดเห็น
                    </div>
                  ) : (
                    comments.map((comment) => (
                      <div
                        key={comment.id}
                        className="rounded-2xl border bg-card p-4"
                      >
                        <div className="flex items-start gap-3">
                          <div className="w-10 h-10 rounded-full bg-muted overflow-hidden flex items-center justify-center shrink-0">
                            {comment.authorAvatar ? (
                              <img
                                src={comment.authorAvatar}
                                alt={comment.authorName}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <span className="text-xs font-semibold">
                                {comment.authorName.slice(0, 2)}
                              </span>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div>
                                <p className="font-medium text-sm">
                                  {comment.authorName}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {comment.authorRole || "ผู้ใช้"} •{" "}
                                  {formatThaiDateTime(comment.created_at)}
                                </p>
                              </div>
                            </div>

                            <p className="mt-2 text-sm leading-7 text-muted-foreground whitespace-pre-line">
                              {comment.content}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NewsCard({
  news,
  featured = false,
  onOpen,
  onLike,
}: {
  news: NewsItem;
  featured?: boolean;
  onOpen: () => void;
  onLike: () => void;
}) {
  return (
    <motion.div whileHover={{ y: -4 }}>
      <Card className="overflow-hidden h-full cursor-pointer hover:shadow-lg transition-shadow">
        <div onClick={onOpen}>
          {news.cover_image_url ? (
            <img
              src={news.cover_image_url}
              alt={news.title}
              className={[
                "w-full object-cover",
                featured ? "h-64" : "h-48",
              ].join(" ")}
            />
          ) : (
            <div
              className={[
                "w-full bg-muted flex items-center justify-center",
                featured ? "h-64" : "h-48",
              ].join(" ")}
            >
              <Newspaper className="w-10 h-10 text-muted-foreground" />
            </div>
          )}
        </div>

        <CardContent className="p-5 space-y-3">
          <div className="flex items-center justify-between gap-3">
            {news.category && (
              <Badge className="rounded-full">{news.category}</Badge>
            )}

            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Calendar className="w-3 h-3" />
              {formatThaiDate(news.created_at)}
            </span>
          </div>

          <div onClick={onOpen} className="space-y-2">
            <h3
              className={[
                "font-semibold line-clamp-2",
                featured ? "text-xl" : "text-base",
              ].join(" ")}
            >
              {news.title}
            </h3>

            <p className="text-sm text-muted-foreground line-clamp-2 leading-6">
              {news.excerpt || news.content || "ไม่มีคำโปรย"}
            </p>
          </div>

          <div className="flex items-center justify-between pt-2 text-sm text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1">
                <Eye className="w-4 h-4" />
                {news.views_count.toLocaleString("th-TH")}
              </span>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onLike();
                }}
                className={[
                  "flex items-center gap-1 transition",
                  news.is_liked ? "text-red-600" : "hover:text-red-600",
                ].join(" ")}
              >
                <Heart
                  className="w-4 h-4"
                  fill={news.is_liked ? "currentColor" : "none"}
                />
                {news.likes_count.toLocaleString("th-TH")}
              </button>

              <span className="flex items-center gap-1">
                <MessageCircle className="w-4 h-4" />
                {news.comments_count.toLocaleString("th-TH")}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
