"use client";

import { useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Edit2, Trash2, Link as LinkIcon } from "lucide-react";
import { useToast } from "@/app/context/ToastContext";
import { useGetAdminSurveysQuery, useDeleteAdminSurveyMutation, Survey, useGetMeQuery } from "@/app/store/apiSlice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { SurveyFormModal } from "@/components/dashboard/SurveyFormModal";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function SurveysPage() {
  const { showToast } = useToast();
  const { data: user, isLoading: isUserLoading } = useGetMeQuery();
  const { data: surveys = [], isLoading } = useGetAdminSurveysQuery(undefined, {
    skip: !user?.surveyAdmin,
  });
  const [deleteSurvey] = useDeleteAdminSurveyMutation();

  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingSurvey, setEditingSurvey] = useState<Survey | null>(null);

  if (!isUserLoading && !user?.surveyAdmin) {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 relative z-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Access Denied</h2>
          <p className="text-slate-500">You must be a superadmin to view this page.</p>
        </div>
      </main>
    );
  }

  const handleOpenCreate = () => {
    setEditingSurvey(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (survey: Survey) => {
    setEditingSurvey(survey);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) return;
    try {
      await deleteSurvey(id).unwrap();
      showToast("Survey deleted", "success");
    } catch (error) {
      showToast("Failed to delete survey", "error");
    }
  };

  const filteredSurveys = surveys.filter(s => 
    (s.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (s.projectId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6"
      >
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
          <Input 
            placeholder="Search surveys by name or ID..." 
            className="pl-9 bg-white border-slate-200 text-slate-900 placeholder:text-slate-400 focus-visible:ring-emerald-500 rounded-xl shadow-xs" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Button onClick={handleOpenCreate} className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white shrink-0 w-full sm:w-auto font-medium shadow-xs rounded-xl">
          <PlusCircle className="h-4 w-4" />
          Create Survey
        </Button>
      </motion.div>

      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="w-full"
      >
        <Card className="bg-white border-slate-200/80 shadow-xs rounded-2xl flex flex-col h-full w-full overflow-hidden">
          <CardHeader className="pb-6 border-b border-slate-100">
            <CardTitle className="text-xl font-bold text-slate-900">Survey Listing</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-slate-50/80">
                <TableRow className="border-slate-100 hover:bg-transparent">
                  <TableHead className="font-semibold text-slate-600 pl-6 py-4">Survey Name</TableHead>
                  <TableHead className="font-semibold text-slate-600">Project ID</TableHead>
                  <TableHead className="font-semibold text-slate-600 hidden sm:table-cell">Supplier</TableHead>
                  <TableHead className="font-semibold text-slate-600">Status</TableHead>
                  <TableHead className="font-semibold text-slate-600 hidden md:table-cell">Created</TableHead>
                  <TableHead className="font-semibold text-slate-600 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`} className="border-slate-100">
                        <TableCell className="pl-6"><Skeleton className="h-5 w-32 bg-slate-100 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-20 bg-slate-100 rounded-md" /></TableCell>
                        <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24 bg-slate-100 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-16 bg-slate-100 rounded-full" /></TableCell>
                        <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24 bg-slate-100 rounded-md" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto bg-slate-100 rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : filteredSurveys.length === 0 ? (
                    <TableRow className="border-none">
                      <TableCell colSpan={6} className="h-32 text-center text-slate-500 font-medium">
                        No surveys found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredSurveys.map((survey, index) => (
                      <motion.tr 
                        key={survey._id} 
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ delay: index * 0.05 }}
                        className="group transition-colors border-slate-100 hover:bg-slate-50/60"
                      >
                        <TableCell className="font-medium text-slate-900 pl-6">
                          {survey.name}
                        </TableCell>
                        <TableCell className="font-mono text-sm text-slate-600">{survey.projectId}</TableCell>
                        <TableCell className="hidden sm:table-cell text-slate-600">
                          {survey.supplierId?.name || <span className="text-slate-400 italic">None</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={
                            survey.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium" :
                            survey.status === 'paused' ? "bg-amber-50 text-amber-700 border-amber-200 font-medium" :
                            "bg-slate-100 text-slate-700 border-slate-200 font-medium"
                          }>
                            {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell text-sm text-slate-500">
                          {new Date(survey.createdAt).toLocaleDateString()}
                        </TableCell>
                        <TableCell className="text-right pr-6">
                          <div className="flex justify-end gap-1.5">
                            <Button variant="ghost" size="icon" title="View Links" asChild className="h-8 w-8 text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg">
                              <Link href={`/dashboard/surveys/${survey._id}`}>
                                <LinkIcon className="h-4 w-4" />
                              </Link>
                            </Button>
                            <Button variant="ghost" size="icon" title="Edit" onClick={() => handleOpenEdit(survey)} className="h-8 w-8 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg">
                              <Edit2 className="h-4 w-4" />
                            </Button>
                            <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(survey._id)} className="h-8 w-8 text-slate-500 hover:text-rose-600 hover:bg-rose-50 rounded-lg">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </motion.tr>
                    ))
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <SurveyFormModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        surveyToEdit={editingSurvey} 
      />
    </main>
  );
}
