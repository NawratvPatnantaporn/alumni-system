"use client";

import { useState, useEffect, Suspense } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth, permissions } from "@/contexts/auth-context";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Users, Building2, GraduationCap, MapPin, Mail, CheckCircle, Grid3X3, List, ArrowUpDown } from "lucide-react";
import Link from "next/link";
import Loading from "./loading";
import { getAlumniDirectory, getAlumniDirectoryFilterOptions, } from "@/app/features/directory/service/directory.service";
import type { AlumniCardItem, DirectoryFilterOptions, DirectorySort } from "@/app/features/directory/types/alumi";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.05 } },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

function useDebouncedValue<T>(value: T, delay = 400) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => window.clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

export default function DirectoryPage() {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFaculty, setSelectedFaculty] = useState("ทั้งหมด");
  const [selectedAdmissionYear, setSelectedAdmissionYear] = useState("");
  const [selectedGraduationYear, setSelectedGraduationYear] = useState("");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [sortBy, setSortBy] = useState<DirectorySort>("recent");
  const [alumniList, setAlumniList] = useState<AlumniCardItem[]>([]);
  const [filterOptions, setFilterOptions] = useState<DirectoryFilterOptions>({
    faculties: [],
    admissionYears: [],
    graduationYears: [],
  });
  const [loadingDirectory, setLoadingDirectory] = useState(true);
  const [directoryError, setDirectoryError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const pageSize = 12;
  const debouncedSearchQuery = useDebouncedValue(searchQuery, 400);

  const canView = permissions.canViewAlumniDirectory(user?.role);

  useEffect(() => {
    const savedViewMode = window.localStorage.getItem("directory:viewMode");
    const savedSortBy = window.localStorage.getItem("directory:sortBy");

    if (savedViewMode === "grid" || savedViewMode === "list") {
      setViewMode(savedViewMode);
    }

    if (
      savedSortBy === "recent" ||
      savedSortBy === "name" ||
      savedSortBy === "admission_year"
    ) {
      setSortBy(savedSortBy);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem("directory:viewMode", viewMode);
  }, [viewMode]);

  useEffect(() => {
    window.localStorage.setItem("directory:sortBy", sortBy);
  }, [sortBy]);

  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const result = await getAlumniDirectoryFilterOptions();
        setFilterOptions(result);
      } catch (error) {
        console.error("LOAD DIRECTORY FILTER OPTIONS ERROR:", error);
      }
    };

    loadFilterOptions();
  }, []);

  useEffect(() => {
    setPage(1);
  }, [debouncedSearchQuery, selectedFaculty, selectedAdmissionYear, selectedGraduationYear, sortBy]);

  useEffect(() => {
    if (!user?.id) return;

    const loadDirectory = async () => {
      try {
        setLoadingDirectory(true);
        setDirectoryError(null);

        const result = await getAlumniDirectory({
          currentUserId: user.id,
          search: debouncedSearchQuery,
          faculty: selectedFaculty,
          admissionYear: selectedAdmissionYear,
          graduationYear: selectedGraduationYear,
          sortBy,
          page,
          pageSize,
        });

        setAlumniList(result.items);
        setTotal(result.total);
        setTotalPages(result.totalPages);
      } catch (error) {
        console.error("LOAD DIRECTORY ERROR:", error);
        setAlumniList([]);
        setTotal(0);
        setTotalPages(1);
        setDirectoryError("ไม่สามารถโหลดรายชื่อศิษย์เก่าได้ กรุณาลองใหม่อีกครั้ง");
      } finally {
        setLoadingDirectory(false);
      }
    };

    loadDirectory();
  }, [ user?.id, debouncedSearchQuery, selectedFaculty, selectedAdmissionYear, selectedGraduationYear, sortBy, page ]);

  if (!canView) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <Users className="w-8 h-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-semibold mb-2">ไม่สามารถเข้าถึงได้</h2>
        <p className="text-muted-foreground max-w-md">
          เฉพาะศิษย์เก่าและผู้ดูแลระบบเท่านั้นที่สามารถค้นหาศิษย์เก่าได้
        </p>
      </div>
    );
  }

  return (
    <Suspense fallback={<Loading />}>
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold flex items-center gap-3">
              <Users className="w-8 h-8 text-primary" />
              ค้นหาศิษย์เก่า
            </h1>
            <p className="text-muted-foreground mt-1">
              ค้นหาและเชื่อมต่อกับศิษย์เก่าจากทุกรุ่น
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant={viewMode === "grid" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("grid")}
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>

            <Button
              variant={viewMode === "list" ? "default" : "outline"}
              size="icon"
              onClick={() => setViewMode("list")}
            >
              <List className="w-4 h-4" />
            </Button>
          </div>
        </div>

        <Card>
          <CardContent className="p-4">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="ค้นหาชื่อ, บริษัท, ตำแหน่ง..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9"
                />
              </div>

              <div className="flex flex-wrap gap-3">
                <Select
                  value={selectedFaculty}
                  onValueChange={setSelectedFaculty}
                >
                  <SelectTrigger className="w-[180px]">
                    <GraduationCap className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="คณะ" />
                  </SelectTrigger>
                  <SelectContent>
                    {["ทั้งหมด", ...filterOptions.faculties].map((faculty) => (
                      <SelectItem key={faculty} value={faculty}>
                        {faculty}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Input
                  list="admission-years"
                  value={selectedAdmissionYear}
                  onChange={(e) =>
                    setSelectedAdmissionYear(e.target.value)
                  }
                  placeholder="ปีที่เข้าศึกษา"
                  className="w-[170px]"
                />
                <datalist id="admission-years">
                  {filterOptions.admissionYears.map((year) => (
                    <option key={year} value={String(year)}>
                      {year}
                    </option>
                  ))}
                </datalist>

                <Select
                  value={sortBy}
                  onValueChange={(v) => setSortBy(v as DirectorySort)}
                >
                  <SelectTrigger className="w-[170px]">
                    <ArrowUpDown className="w-4 h-4 mr-2" />
                    <SelectValue placeholder="เรียงตาม" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">อัปเดตล่าสุด</SelectItem>
                    <SelectItem value="name">ชื่อ</SelectItem>
                    <SelectItem value="year">ปีเข้าศึกษา</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            พบ{" "}
            <span className="font-medium text-foreground">
              {total}
            </span>{" "}
            คน
          </p>

          {(searchQuery.trim() ||
            selectedFaculty !== "ทั้งหมด" ||
            selectedAdmissionYear.trim() !== "") && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSearchQuery("");
                setSelectedFaculty("ทั้งหมด");
                setSelectedAdmissionYear("");
              }}
            >
              ล้างการค้นหา
            </Button>
          )}
        </div>

        {directoryError && !loadingDirectory && (
          <Card className="border-destructive/30 bg-destructive/5">
            <CardContent className="p-6 text-center">
              <Users className="w-10 h-10 text-destructive mx-auto mb-3" />
              <h3 className="font-semibold text-destructive mb-2">
                โหลดข้อมูลไม่สำเร็จ
              </h3>
              <p className="text-sm text-muted-foreground mb-4">
                {directoryError}
              </p>
              <Button
                variant="outline"
                onClick={() => {
                  setPage(1);
                  setDirectoryError(null);
                }}
              >
                ลองใหม่
              </Button>
            </CardContent>
          </Card>
        )}

        {loadingDirectory ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, index) => (
              <Card
                key={`directory-skeleton-${index}`}
                className="h-[300px] animate-pulse"
              />
            ))}
          </div>
        ) : (
          <AnimatePresence mode="wait">
            <motion.div
              key={`${viewMode}-${page}-${debouncedSearchQuery}-${selectedFaculty}-${selectedAdmissionYear}-${selectedGraduationYear}-${sortBy}`}
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              className={
                viewMode === "grid"
                  ? "grid sm:grid-cols-2 lg:grid-cols-3 gap-4"
                  : "space-y-3"
              }
            >
              {alumniList.map((alumni) => (
                <motion.div key={alumni.id} variants={itemVariants}>
                  <Link href={`/profile/${alumni.id}`}>
                    <Card className="hover:shadow-lg transition-all duration-300 cursor-pointer group overflow-hidden">
                      <CardContent
                        className={
                          viewMode === "grid"
                            ? "p-6 min-h-[310px] flex flex-col justify-center"
                            : "p-4"
                        }
                      >
                        {viewMode === "grid" ? (
                          <div className="text-center">
                            <div className="relative inline-block mb-4">
                              <Avatar className="w-20 h-20 mx-auto ring-4 ring-background group-hover:ring-primary/20 transition-all">
                                <AvatarImage
                                  src={alumni.avatar || "/placeholder.svg"}
                                  alt={alumni.name}
                                />
                                <AvatarFallback className="text-lg">
                                  {alumni.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>

                              {alumni.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background">
                                  <CheckCircle className="w-4 h-4 text-white" />
                                </div>
                              )}

                              {alumni.isActive && (
                                <div className="absolute top-0 right-0 w-3 h-3 bg-emerald-500 rounded-full ring-2 ring-background" />
                              )}
                            </div>

                            <h3 className="font-semibold text-xl mb-1 group-hover:text-primary transition-colors">
                              {alumni.name}
                            </h3>

                            <p className="text-base text-muted-foreground mb-3">
                              {alumni.position || "-"}
                            </p>

                            <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground mb-3">
                              <Building2 className="w-3 h-3" />
                              <span>{alumni.company || "-"}</span>
                            </div>

                            <div className="flex flex-wrap justify-center gap-2 mt-3">
                              {alumni.faculty && (
                                <Badge
                                  variant="secondary"
                                  className="text-xs rounded-full px-3 py-1"
                                >
                                  <GraduationCap className="w-3 h-3 mr-1" />
                                  {alumni.faculty}
                                </Badge>
                              )}

                              {alumni.admissionYear && (
                                <Badge
                                  variant="outline"
                                  className="text-xs rounded-full px-3 py-1"
                                >
                                  รุ่น {alumni.admissionYear}
                                </Badge>
                              )}

                              {/* {alumni.graduationYear && (
                                <Badge
                                  variant="outline"
                                  className="text-xs rounded-full px-3 py-1"
                                >
                                  รุ่น {alumni.graduationYear}
                                </Badge>
                              )} */}
                            </div>

                            <div className="flex items-center justify-center gap-1 mt-3 text-xs text-muted-foreground">
                              <MapPin className="w-3 h-3" />
                              <span>{alumni.location || "-"}</span>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center gap-4">
                            <div className="relative flex-shrink-0">
                              <Avatar className="w-14 h-14">
                                <AvatarImage
                                  src={alumni.avatar || "/placeholder.svg"}
                                  alt={alumni.name}
                                />
                                <AvatarFallback>
                                  {alumni.name.slice(0, 2)}
                                </AvatarFallback>
                              </Avatar>

                              {alumni.isVerified && (
                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center ring-2 ring-background">
                                  <CheckCircle className="w-3 h-3 text-white" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <h3 className="font-semibold group-hover:text-primary transition-colors">
                                  {alumni.name}
                                </h3>

                                {alumni.isActive && (
                                  <Badge className="bg-emerald-500 text-white text-xs">
                                    Active
                                  </Badge>
                                )}
                              </div>

                              <p className="text-sm text-muted-foreground">
                                {alumni.position || "-"} @{" "}
                                {alumni.company || "-"}
                              </p>

                              <div className="flex flex-wrap items-center gap-3 mt-2 text-xs text-muted-foreground">
                                <span className="flex items-center gap-1">
                                  <GraduationCap className="w-3 h-3" />
                                  {alumni.faculty || "-"} ปีเข้า{" "}
                                  {alumni.admissionYear ?? "-"}
                                </span>

                                <span className="flex items-center gap-1">
                                  <MapPin className="w-3 h-3" />
                                  {alumni.location || "-"}
                                </span>
                              </div>
                            </div>

                            <div className="hidden md:flex items-center gap-2">
                              <Button variant="outline" size="sm">
                                <Mail className="w-4 h-4 mr-1" />
                                ติดต่อ
                              </Button>
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        )}

        {!loadingDirectory && directoryError && totalPages > 1 && (
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
            <p className="text-sm text-muted-foreground">
              หน้า {page} จาก {totalPages}
            </p>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((prev) => prev - 1)}
              >
                ก่อนหน้า  
              </Button>

              <Button
                variant="outline"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((prev) => Math.min(totalPages, prev + 1))}
              >
                ถัดไป
              </Button>
            </div>
          </div>
        )}

        {!loadingDirectory && !directoryError && alumniList.length === 0 && (
          <div className="text-center py-12">
            <Users className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">ไม่พบศิษย์เก่า</h3>
            <p className="text-sm text-muted-foreground">
              ลองปรับเงื่อนไขการค้นหา
            </p>
          </div>
        )}
      </div>
    </Suspense>
  );
}
