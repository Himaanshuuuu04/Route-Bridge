"use client";

import React, { useState, useEffect } from "react";
import { Plus, X, Settings, Link as LinkIcon, Trash2, FolderGit2, FileText, Globe, Activity, Building2, Sparkles, Copy, PlusCircle, AlertCircle, Save } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/app/context/ToastContext";
import {
  useGetSuppliersQuery,
  useCreateSupplierMutation,
  useDeleteSupplierMutation,
  useGetVendorsQuery,
  useCreateVendorMutation,
  useDeleteVendorMutation,
  useCreateAdminSurveyMutation,
  useUpdateAdminSurveyMutation,
  Survey,
} from "@/app/store/apiSlice";

interface SurveyFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  surveyToEdit: Survey | null;
}

export function SurveyFormModal({ isOpen, onClose, surveyToEdit }: SurveyFormModalProps) {
  const { showToast } = useToast();
  
  const { data: suppliers = [] } = useGetSuppliersQuery(undefined, { skip: !isOpen });
  const { data: vendors = [] } = useGetVendorsQuery(undefined, { skip: !isOpen });
  
  const [createSupplier] = useCreateSupplierMutation();
  const [deleteSupplier] = useDeleteSupplierMutation();
  const [createVendor] = useCreateVendorMutation();
  const [deleteVendor] = useDeleteVendorMutation();
  const [createSurvey, { isLoading: isCreating }] = useCreateAdminSurveyMutation();
  const [updateSurvey, { isLoading: isUpdating }] = useUpdateAdminSurveyMutation();

  const [formData, setFormData] = useState({
    name: "",
    projectId: "",
    supplierId: "",
    baseSupplierUrl: "",
    status: "active",
  });

  interface EligibilityRule {
    question: string;
    options: string[];
    acceptedAnswers: string[];
  }

  const [rules, setRules] = useState<EligibilityRule[]>([]);
  const [vendorLinks, setVendorLinks] = useState<{ vendorId: string; quota: number; hash: string }[]>([]);

  const [newSupplierName, setNewSupplierName] = useState("");
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCompleteUrl, setNewVendorCompleteUrl] = useState("");
  const [newVendorTerminateUrl, setNewVendorTerminateUrl] = useState("");
  const [newVendorQuotaFullUrl, setNewVendorQuotaFullUrl] = useState("");
  const [newVendorSecurityTermUrl, setNewVendorSecurityTermUrl] = useState("");
  const [isAddingVendor, setIsAddingVendor] = useState(false);

  const [ipFiltering, setIpFiltering] = useState(false);
  const [allowedCountries, setAllowedCountries] = useState("");

  useEffect(() => {
    if (surveyToEdit) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setFormData({
        name: surveyToEdit.name || "",
        projectId: surveyToEdit.projectId || "",
        supplierId: surveyToEdit.supplierId?._id || "",
        baseSupplierUrl: surveyToEdit.baseSupplierUrl || "",
        status: surveyToEdit.status || "active",
      });
      setIpFiltering(surveyToEdit.ipFiltering || false);
      setAllowedCountries((surveyToEdit.allowedCountries || []).join(", "));
      
      const rulesArr = Array.isArray(surveyToEdit.eligibilityRules) 
        ? surveyToEdit.eligibilityRules
        : [];
      setRules(rulesArr);
      
      interface RawVendorLink {
        vendorId?: { _id: string; name?: string } | string | null;
        quota?: number;
        hash?: string;
      }
      const linksArr = (surveyToEdit.vendorLinks || []).map((vl: RawVendorLink) => ({
        vendorId: vl.vendorId && typeof vl.vendorId === 'object' ? vl.vendorId._id : (vl.vendorId as string) || "",
        quota: vl.quota || 0,
        hash: vl.hash || ""
      }));
      setVendorLinks(linksArr);
    } else {
      setFormData({
        name: "",
        projectId: "",
        supplierId: "",
        baseSupplierUrl: "",
        status: "active",
      });
      setIpFiltering(false);
      setAllowedCountries("");
      setRules([]);
      setVendorLinks([]);
    }
  }, [surveyToEdit, isOpen]);

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) return;
    try {
      const res = await createSupplier({ name: newSupplierName, isActive: true }).unwrap();
      setFormData({ ...formData, supplierId: res._id });
      setNewSupplierName("");
      setIsAddingSupplier(false);
      showToast("Supplier created", "success");
    } catch {
      showToast("Failed to create supplier", "error");
    }
  };

  const handleCreateVendor = async () => {
    if (!newVendorName.trim()) return;
    try {
      await createVendor({ 
        name: newVendorName.trim(), 
        completeUrl: newVendorCompleteUrl.trim() || undefined,
        terminateUrl: newVendorTerminateUrl.trim() || undefined,
        quotaFullUrl: newVendorQuotaFullUrl.trim() || undefined,
        securityTermUrl: newVendorSecurityTermUrl.trim() || undefined,
        isActive: true 
      }).unwrap();
      setNewVendorName("");
      setNewVendorCompleteUrl("");
      setNewVendorTerminateUrl("");
      setNewVendorQuotaFullUrl("");
      setNewVendorSecurityTermUrl("");
      setIsAddingVendor(false);
      showToast("Vendor created successfully", "success");
    } catch {
      showToast("Failed to create vendor", "error");
    }
  };

  const handleDeleteSupplier = async (id: string) => {
    if (confirm("Are you sure you want to delete this supplier? This will remove it from all surveys.")) {
      try {
        await deleteSupplier(id).unwrap();
        if (formData.supplierId === id) {
          setFormData({ ...formData, supplierId: "" });
        }
        showToast("Supplier deleted successfully", "success");
      } catch {
        showToast("Failed to delete supplier", "error");
      }
    }
  };

  const handleDeleteVendor = async (id: string) => {
    if (confirm("Are you sure you want to delete this vendor? This will remove it from all surveys and routing links.")) {
      try {
        await deleteVendor(id).unwrap();
        setVendorLinks(vendorLinks.filter(vl => vl.vendorId !== id));
        showToast("Vendor deleted successfully", "success");
      } catch {
        showToast("Failed to delete vendor", "error");
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const eligibilityRules = rules.filter(r => r.question.trim() && r.options.length > 0 && r.acceptedAnswers.length > 0);

    const payload = {
      ...formData,
      ipFiltering,
      allowedCountries: allowedCountries.split(',').map(s => s.trim()).filter(s => s),
      eligibilityRules,
      vendorLinks: vendorLinks.filter(vl => vl.vendorId)
    };

    try {
      if (surveyToEdit) {
        await updateSurvey({ id: surveyToEdit._id, data: payload }).unwrap();
        showToast("Survey updated successfully", "success");
      } else {
        await createSurvey(payload).unwrap();
        showToast("Survey created successfully", "success");
      }
      onClose();
    } catch (error: unknown) {
      const err = error as { data?: { message?: string } };
      showToast(err.data?.message || "Operation failed", "error");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className="max-w-6xl w-[95vw] sm:max-w-3xl md:max-w-4xl lg:max-w-6xl h-[85vh] max-h-[90vh] flex flex-col p-0 overflow-hidden bg-zinc-950 border border-zinc-800 text-white rounded-xl shadow-2xl"
        onInteractOutside={(e) => e.preventDefault()}
      >
        <DialogHeader className="p-4 sm:p-6 pb-4 border-b border-zinc-800 flex flex-row items-center justify-between">
          <div className="space-y-1">
            <DialogTitle className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-emerald-400" />
              {surveyToEdit ? "Edit Survey Details" : "Configure New Survey"}
            </DialogTitle>
            <DialogDescription className="text-zinc-400 text-sm">
              Configure your routing paths, target audience rules, and vendor quotas.
            </DialogDescription>
          </div>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex-1 flex flex-col overflow-hidden">
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8 custom-scrollbar">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8">
              
              {/* Left Column: General Configuration */}
              <div className="lg:col-span-5 space-y-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2 border-b border-zinc-800 pb-2">
                    <span className="p-1 rounded bg-emerald-500/10 text-emerald-400">
                      <Settings className="h-4 w-4" />
                    </span>
                    <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">General Information</h3>
                  </div>

                  {/* Survey Name */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <FileText className="h-3.5 w-3.5 text-zinc-500" />
                      Survey Name <span className="text-emerald-400">*</span>
                    </label>
                    <Input 
                      required 
                      value={formData.name} 
                      onChange={e => setFormData({ ...formData, name: e.target.value })}
                      placeholder="e.g. US Tech Decision Makers B2B" 
                      className="h-10 bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder:text-zinc-500 transition-all"
                    />
                  </div>

                  {/* Project ID */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <FolderGit2 className="h-3.5 w-3.5 text-zinc-500" />
                      Project ID <span className="text-emerald-400">*</span>
                    </label>
                    <Input 
                      required 
                      value={formData.projectId} 
                      onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                      placeholder="e.g. PROJ-2026-X" 
                      className="h-10 bg-zinc-900/50 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder:text-zinc-500 transition-all font-mono"
                    />
                  </div>

                  {/* Supplier Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Building2 className="h-3.5 w-3.5 text-zinc-500" />
                      Supplier Partner
                    </label>
                    <div className="flex gap-2">
                      <Select value={formData.supplierId} onValueChange={v => setFormData({ ...formData, supplierId: v })}>
                        <SelectTrigger className="h-10 w-full bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all">
                          <SelectValue placeholder="Choose a supplier" />
                        </SelectTrigger>
                        <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                          {suppliers.map(sup => (
                            <SelectItem key={sup._id} value={sup._id} className="focus:bg-zinc-900 focus:text-white cursor-pointer">{sup.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="icon" 
                        onClick={() => setIsAddingSupplier(!isAddingSupplier)} 
                        title="Add New Supplier" 
                        className={`h-10 w-10 bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition-all ${isAddingSupplier ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5' : ''}`}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>

                    {/* Inline Add Supplier Form */}
                    <AnimatePresence>
                      {isAddingSupplier && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="overflow-hidden bg-emerald-950/20 border border-emerald-500/20 rounded-lg p-3 mt-2 space-y-2"
                        >
                          <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                            <PlusCircle className="h-3 w-3" /> Create New Supplier
                          </div>
                          <div className="flex gap-2">
                            <Input 
                              placeholder="e.g. Lucid Surveys" 
                              value={newSupplierName} 
                              onChange={e => setNewSupplierName(e.target.value)} 
                              autoFocus
                              className="h-9 bg-zinc-950 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white"
                            />
                            <Button type="button" size="sm" onClick={handleCreateSupplier} className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium">Save</Button>
                            <Button type="button" size="sm" variant="ghost" onClick={() => { setIsAddingSupplier(false); setNewSupplierName(""); }} className="text-zinc-400 hover:text-white hover:bg-zinc-900"><X className="h-4 w-4" /></Button>
                          </div>
                          
                          {suppliers.length > 0 && (
                            <div className="pt-2 border-t border-emerald-500/10 space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                              <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 select-none">Existing Suppliers</div>
                              {suppliers.map(sup => (
                                <div key={sup._id} className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-zinc-900/50 group/sup">
                                  <span className="text-zinc-300 truncate">{sup.name}</span>
                                  <button 
                                    type="button" 
                                    onClick={() => handleDeleteSupplier(sup._id)}
                                    className="text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover/sup:opacity-100 p-0.5"
                                    title={`Delete ${sup.name}`}
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Status Selection */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Activity className="h-3.5 w-3.5 text-zinc-500" />
                      Status
                    </label>
                    <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                      <SelectTrigger className="h-10 bg-zinc-900/50 border-zinc-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 transition-all">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                        <SelectItem value="active" className="focus:bg-zinc-900 focus:text-white cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-emerald-500 shadow-glow" /> Active
                          </span>
                        </SelectItem>
                        <SelectItem value="paused" className="focus:bg-zinc-900 focus:text-white cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-amber-500 shadow-glow" /> Paused
                          </span>
                        </SelectItem>
                        <SelectItem value="closed" className="focus:bg-zinc-900 focus:text-white cursor-pointer">
                          <span className="flex items-center gap-2">
                            <span className="h-2 w-2 rounded-full bg-red-500 shadow-glow" /> Closed
                          </span>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Base Supplier URL */}
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                      <Globe className="h-3.5 w-3.5 text-zinc-500" />
                      Base Supplier URL <span className="text-emerald-400">*</span>
                    </label>
                    <textarea 
                      required 
                      value={formData.baseSupplierUrl} 
                      onChange={e => setFormData({ ...formData, baseSupplierUrl: e.target.value })}
                      placeholder="e.g. https://supplier-portal.com/survey/start?pid=XYZ&uid=[identifier]" 
                      rows={3}
                      className="w-full text-sm p-3 bg-zinc-900/50 border border-zinc-800 rounded-md focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder:text-zinc-500 transition-all font-mono resize-none focus:outline-none"
                    />
                    <div className="flex gap-2 items-start bg-blue-500/5 border border-blue-500/20 p-2.5 rounded-lg text-xs text-blue-400">
                      <span className="font-semibold select-none mt-0.5">ℹ</span>
                      <p className="leading-normal">
                        Include <code className="bg-blue-500/10 px-1 py-0.5 rounded text-blue-300 border border-blue-500/10">[identifier]</code> where the redirect token should be injected.
                      </p>
                    </div>
                  </div>

                  {/* IP Filtering Configuration */}
                  <div className="space-y-4 pt-4 border-t border-zinc-800">
                    <div className="flex items-center gap-2 pb-2">
                      <span className="p-1 rounded bg-blue-500/10 text-blue-400">
                        <Globe className="h-4 w-4" />
                      </span>
                      <h3 className="text-sm font-semibold tracking-wide uppercase text-zinc-300">Region Control</h3>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 cursor-pointer" htmlFor="ipFiltering">
                        Enable IP Filtering
                      </label>
                      <input 
                        id="ipFiltering"
                        type="checkbox" 
                        checked={ipFiltering}
                        onChange={(e) => setIpFiltering(e.target.checked)}
                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-blue-500 focus:ring-blue-500/50 cursor-pointer"
                      />
                    </div>

                    <AnimatePresence>
                      {ipFiltering && (
                        <motion.div 
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: "auto" }}
                          exit={{ opacity: 0, height: 0 }}
                          className="space-y-2 overflow-hidden"
                        >
                          <label className="text-xs font-semibold uppercase tracking-wider text-zinc-400 flex items-center gap-1.5">
                            Allowed Country Codes
                          </label>
                          <Input 
                            value={allowedCountries} 
                            onChange={e => setAllowedCountries(e.target.value)}
                            placeholder="e.g. US, IN, GB" 
                            className="h-10 bg-zinc-900/50 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-zinc-500 transition-all font-mono"
                          />
                          <p className="text-[10px] text-zinc-500">Comma-separated country codes (ISO 3166-1 alpha-2)</p>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>

              {/* Right Column: Targeting and Distributions */}
              <div className="lg:col-span-7 space-y-6">
                
                {/* Eligibility Rules Panel */}
                <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                  <div className="flex items-center justify-between border-b border-zinc-850 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold tracking-wide uppercase text-zinc-200 flex items-center gap-2">
                        <Settings className="h-4 w-4 text-emerald-400" />
                        Eligibility Rules
                      </h4>
                      <p className="text-xs text-zinc-400">Incoming parameters that respondents must match.</p>
                    </div>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setRules([...rules, { question: "", options: [""], acceptedAnswers: [] }])} 
                      className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all gap-1.5 h-8"
                    >
                      <Plus className="h-3.5 w-3.5 text-emerald-400" /> Add Question
                    </Button>
                  </div>

                  <div className="min-h-[80px]">
                    {rules.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-6 border border-dashed border-zinc-800 rounded-lg text-zinc-500 bg-zinc-900/10">
                        <AlertCircle className="h-5 w-5 mb-1.5 text-zinc-500" />
                        <span className="text-xs font-medium">No questions defined</span>
                        <span className="text-[10px] text-zinc-500">All traffic will pass automatically.</span>
                      </div>
                    ) : (
                      <div className="space-y-4 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        <AnimatePresence initial={false}>
                          {rules.map((rule, qIdx) => (
                            <motion.div 
                              key={qIdx}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-4 space-y-3 relative"
                            >
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-2 top-2 h-7 w-7 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md" 
                                onClick={() => setRules(rules.filter((_, i) => i !== qIdx))}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>

                              <div className="pr-8">
                                <label className="text-[10px] font-semibold text-zinc-400 uppercase">Question Text</label>
                                <Input 
                                  placeholder="e.g. What is your age?" 
                                  value={rule.question} 
                                  onChange={e => {
                                    const n = [...rules]; n[qIdx].question = e.target.value; setRules(n);
                                  }}
                                  className="h-9 bg-zinc-950 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder:text-zinc-500 mt-1"
                                />
                              </div>

                              <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                  <label className="text-[10px] font-semibold text-zinc-400 uppercase">Options & Accepted Answers</label>
                                  <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="sm" 
                                    onClick={() => {
                                      const n = [...rules]; n[qIdx].options.push(""); setRules(n);
                                    }}
                                    className="h-6 text-[10px] px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                                  >
                                    <Plus className="h-3 w-3 mr-1" /> Add Option
                                  </Button>
                                </div>
                                <div className="space-y-2">
                                  {rule.options.map((opt, optIdx) => (
                                    <div key={optIdx} className="flex items-center gap-2">
                                      <input 
                                        type="checkbox" 
                                        checked={rule.acceptedAnswers.includes(opt) && opt !== ""}
                                        onChange={(e) => {
                                          const n = [...rules];
                                          if (e.target.checked && opt.trim() !== "") {
                                            n[qIdx].acceptedAnswers.push(opt);
                                          } else {
                                            n[qIdx].acceptedAnswers = n[qIdx].acceptedAnswers.filter(a => a !== opt);
                                          }
                                          setRules(n);
                                        }}
                                        disabled={opt.trim() === ""}
                                        className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/50 focus:ring-offset-zinc-950"
                                        title="Mark as accepted answer"
                                      />
                                      <Input 
                                        placeholder={`Option ${optIdx + 1}`} 
                                        value={opt} 
                                        onChange={e => {
                                          const newVal = e.target.value;
                                          const n = [...rules]; 
                                          const oldVal = n[qIdx].options[optIdx];
                                          n[qIdx].options[optIdx] = newVal;
                                          // Update acceptedAnswers if the old value was selected
                                          if (n[qIdx].acceptedAnswers.includes(oldVal)) {
                                            n[qIdx].acceptedAnswers = n[qIdx].acceptedAnswers.map(a => a === oldVal ? newVal : a);
                                          }
                                          setRules(n);
                                        }}
                                        className="h-8 bg-zinc-950 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder:text-zinc-600 text-sm flex-1"
                                      />
                                      <Button 
                                        type="button" 
                                        variant="ghost" 
                                        size="icon" 
                                        className="h-8 w-8 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 shrink-0" 
                                        onClick={() => {
                                          const n = [...rules];
                                          const removedOpt = n[qIdx].options[optIdx];
                                          n[qIdx].options.splice(optIdx, 1);
                                          n[qIdx].acceptedAnswers = n[qIdx].acceptedAnswers.filter(a => a !== removedOpt);
                                          setRules(n);
                                        }}
                                        disabled={rule.options.length === 1}
                                      >
                                        <X className="h-3.5 w-3.5" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

                {/* Vendor Distribution Panel */}
                <div className="bg-zinc-900/20 border border-zinc-800/80 rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-zinc-850 pb-3">
                    <div className="space-y-0.5">
                      <h4 className="text-sm font-semibold tracking-wide uppercase text-zinc-200 flex items-center gap-2">
                        <LinkIcon className="h-4 w-4 text-violet-400" />
                        Vendor Routing Links
                      </h4>
                      <p className="text-xs text-zinc-400">Manage vendor entry quotas and tracking parameters.</p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setIsAddingVendor(!isAddingVendor)} 
                        className={`bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all gap-1.5 h-8 text-xs ${isAddingVendor ? 'border-violet-500 text-violet-400 bg-violet-500/5' : ''}`}
                      >
                        <Plus className="h-3.5 w-3.5 text-violet-400" /> Create Vendor
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => setVendorLinks([...vendorLinks, { vendorId: "", quota: 0, hash: "" }])} 
                        className="bg-zinc-900 border-zinc-800 hover:bg-zinc-800 text-zinc-200 hover:text-white transition-all gap-1.5 h-8 text-xs"
                      >
                        <Plus className="h-3.5 w-3.5 text-emerald-400" /> Link Vendor
                      </Button>
                    </div>
                  </div>

                  {/* Inline Create Vendor Form */}
                  <AnimatePresence>
                    {isAddingVendor && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden bg-violet-950/20 border border-violet-500/20 rounded-lg p-4 space-y-3"
                      >
                        <div className="text-xs font-semibold text-violet-400 flex items-center gap-1">
                          <PlusCircle className="h-3.5 w-3.5" /> Configure & Save New Vendor
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-[10px] font-semibold text-zinc-400 uppercase">Vendor Name</label>
                            <Input 
                              placeholder="e.g. Dynata UK" 
                              value={newVendorName} 
                              onChange={e => setNewVendorName(e.target.value)} 
                              className="h-9 bg-zinc-950 border-zinc-800 focus:border-violet-500 focus:ring-1 focus:ring-violet-500/50 text-white placeholder:text-zinc-500 text-xs"
                            />
                          </div>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-emerald-400 uppercase">Complete URL</label>
                              <Input 
                                placeholder="https://client.com/complete?uid={{vendor_rid}}" 
                                value={newVendorCompleteUrl} 
                                onChange={e => setNewVendorCompleteUrl(e.target.value)} 
                                className="h-9 bg-zinc-950 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white placeholder:text-zinc-500 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-red-400 uppercase">Terminate URL</label>
                              <Input 
                                placeholder="https://client.com/term?uid={{vendor_rid}}" 
                                value={newVendorTerminateUrl} 
                                onChange={e => setNewVendorTerminateUrl(e.target.value)} 
                                className="h-9 bg-zinc-950 border-zinc-800 focus:border-red-500 focus:ring-1 focus:ring-red-500/50 text-white placeholder:text-zinc-500 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-amber-400 uppercase">Quota Full URL</label>
                              <Input 
                                placeholder="https://client.com/quota?uid={{vendor_rid}}" 
                                value={newVendorQuotaFullUrl} 
                                onChange={e => setNewVendorQuotaFullUrl(e.target.value)} 
                                className="h-9 bg-zinc-950 border-zinc-800 focus:border-amber-500 focus:ring-1 focus:ring-amber-500/50 text-white placeholder:text-zinc-500 text-xs"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-semibold text-blue-400 uppercase">Security Term URL</label>
                              <Input 
                                placeholder="https://client.com/security?uid={{vendor_rid}}" 
                                value={newVendorSecurityTermUrl} 
                                onChange={e => setNewVendorSecurityTermUrl(e.target.value)} 
                                className="h-9 bg-zinc-950 border-zinc-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/50 text-white placeholder:text-zinc-500 text-xs"
                              />
                            </div>
                          </div>
                        </div>
                        <div className="flex justify-end gap-2 pt-1.5 border-t border-violet-500/10">
                          <Button 
                            type="button" 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => {
                              setIsAddingVendor(false);
                              setNewVendorName("");
                              setNewVendorCompleteUrl("");
                              setNewVendorTerminateUrl("");
                              setNewVendorQuotaFullUrl("");
                              setNewVendorSecurityTermUrl("");
                            }} 
                            className="text-zinc-400 hover:text-white hover:bg-zinc-900 text-xs h-8"
                          >
                            Cancel
                          </Button>
                          <Button 
                            type="button" 
                            size="sm" 
                            onClick={handleCreateVendor} 
                            className="bg-violet-600 hover:bg-violet-700 text-white font-medium text-xs h-8"
                          >
                            Save Vendor
                          </Button>
                        </div>

                        {vendors.length > 0 && (
                          <div className="pt-3 border-t border-violet-500/10 space-y-1 max-h-[140px] overflow-y-auto custom-scrollbar">
                            <div className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider mb-1 select-none">Existing Vendors</div>
                            {vendors.map(v => (
                              <div key={v._id} className="flex items-center justify-between text-xs py-1 px-1.5 rounded hover:bg-zinc-900/50 group/v">
                                <div className="flex flex-col min-w-0">
                                  <span className="text-zinc-300 truncate font-medium">{v.name}</span>
                                  <div className="flex gap-1 mt-0.5">
                                    {v.completeUrl && <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Complete URL" />}
                                    {v.terminateUrl && <span className="h-1.5 w-1.5 rounded-full bg-red-500" title="Terminate URL" />}
                                    {v.quotaFullUrl && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" title="Quota Full URL" />}
                                    {v.securityTermUrl && <span className="h-1.5 w-1.5 rounded-full bg-blue-500" title="Security Term URL" />}
                                  </div>
                                </div>
                                <button 
                                  type="button" 
                                  onClick={() => handleDeleteVendor(v._id)}
                                  className="text-zinc-500 hover:text-red-400 transition-colors opacity-0 group-hover/v:opacity-100 p-0.5 shrink-0 ml-2"
                                  title={`Delete ${v.name}`}
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>

                  <div className="min-h-[100px]">
                    {vendorLinks.length === 0 ? (
                      <div className="flex flex-col items-center justify-center py-8 border border-dashed border-zinc-800 rounded-lg text-zinc-500 bg-zinc-900/10">
                        <LinkIcon className="h-5 w-5 mb-1.5 text-zinc-650" />
                        <span className="text-xs font-medium">No vendors linked</span>
                        <span className="text-[10px] text-zinc-500">Link a vendor to generate secure routing links.</span>
                      </div>
                    ) : (
                      <div className="space-y-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
                        <div className="hidden md:flex gap-2 px-1 text-[10px] font-semibold text-zinc-500 uppercase tracking-wider select-none">
                          <div className="flex-[2.5]">Vendor Partner</div>
                          <div className="flex-1">Quota</div>
                          {surveyToEdit && <div className="flex-[1.5]">Hash ID</div>}
                          <div className="w-9"></div>
                        </div>
                        
                        <AnimatePresence initial={false}>
                          {vendorLinks.map((link, idx) => (
                            <motion.div 
                              key={idx}
                              initial={{ opacity: 0, y: -5 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, scale: 0.95 }}
                              className="flex flex-col md:flex-row gap-3 md:gap-2 md:items-center p-3.5 pr-10 md:p-0 bg-zinc-900/30 md:bg-transparent rounded-lg border border-zinc-800/50 md:border-transparent relative"
                            >
                              {/* Vendor Selection */}
                              <div className="flex-[2.5] min-w-0 space-y-1">
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider md:hidden">Vendor Partner</label>
                                <Select 
                                  value={link.vendorId} 
                                  onValueChange={v => {
                                    const n = [...vendorLinks]; n[idx].vendorId = v; setVendorLinks(n);
                                  }}
                                >
                                  <SelectTrigger className="h-9 bg-zinc-900/40 border-zinc-800 text-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-xs transition-all">
                                    <SelectValue placeholder="Select Vendor" />
                                  </SelectTrigger>
                                  <SelectContent className="bg-zinc-950 border-zinc-800 text-white">
                                    {vendors.map(v => (
                                      <SelectItem key={v._id} value={v._id} className="focus:bg-zinc-900 focus:text-white cursor-pointer text-xs">{v.name}</SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Quota Input */}
                              <div className="flex-1 min-w-0 md:min-w-[70px] space-y-1">
                                <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider md:hidden">Quota</label>
                                <Input 
                                  type="number" 
                                  min={0}
                                  value={link.quota} 
                                  onChange={e => {
                                    const n = [...vendorLinks]; n[idx].quota = Number(e.target.value); setVendorLinks(n);
                                  }}
                                  className="h-9 bg-zinc-900/40 border-zinc-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/50 text-white text-xs font-mono text-left md:text-center"
                                />
                              </div>

                              {/* Secure Hash (Only when editing survey) */}
                              {surveyToEdit && (
                                <div className="flex-[1.5] min-w-0 space-y-1">
                                  <label className="text-[10px] font-semibold text-zinc-500 uppercase tracking-wider md:hidden">Hash ID</label>
                                  <div className="relative group/hash">
                                    <Input 
                                      value={link.hash || "Not Generated"} 
                                      disabled 
                                      className="h-9 font-mono text-[10px] bg-zinc-950/80 border-zinc-900 text-zinc-500 pr-7 truncate" 
                                    />
                                    {link.hash && (
                                      <button
                                        type="button"
                                        onClick={() => {
                                          navigator.clipboard.writeText(link.hash);
                                          showToast("Hash copied!", "success");
                                        }}
                                        className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1 text-zinc-500 hover:text-emerald-400 hover:bg-zinc-900 rounded opacity-100 md:opacity-0 md:group-hover/hash:opacity-100 transition-opacity"
                                        title="Copy Hash to Clipboard"
                                      >
                                        <Copy className="h-3 w-3" />
                                      </button>
                                    )}
                                  </div>
                                </div>
                              )}

                              {/* Remove Button */}
                              <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                className="absolute right-2 top-2 md:relative md:right-0 md:top-0 h-8 w-8 md:h-9 md:w-9 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg shrink-0" 
                                onClick={() => {
                                  setVendorLinks(vendorLinks.filter((_, i) => i !== idx));
                                }}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </motion.div>
                          ))}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          </div>
          <DialogFooter className="p-4 sm:p-6 border-t border-zinc-800 bg-zinc-950/80 flex flex-col sm:flex-row items-center justify-end gap-3 mt-0">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="bg-zinc-900 border-zinc-800 hover:bg-zinc-850 text-zinc-300 hover:text-white h-10 px-5 transition-all w-full sm:w-auto"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={isCreating || isUpdating} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-medium h-10 px-5 transition-all w-full sm:w-auto"
            >
              {isCreating || isUpdating ? (
                <span className="flex items-center gap-2">
                  <span className="animate-spin h-4 w-4 border-2 border-white/20 border-t-white rounded-full" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  {surveyToEdit ? "Save Changes" : "Create Survey"}
                </span>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
