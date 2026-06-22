"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PlusCircle, Search, Edit2, Trash2, Link as LinkIcon, Settings, Plus, X } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import api from "../../lib/api";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";

interface Supplier {
  _id: string;
  name: string;
}

interface Vendor {
  _id: string;
  name: string;
}

interface VendorLink {
  vendorId: Vendor;
  hash: string;
  quota: number;
}

interface Survey {
  _id: string;
  name: string;
  projectId: string;
  supplierId: Supplier;
  baseSupplierUrl: string;
  status: string;
  eligibilityRules: Record<string, string>;
  vendorLinks: VendorLink[];
  createdAt: string;
}

export default function SurveysPage() {
  const [surveys, setSurveys] = useState<Survey[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const { showToast } = useToast();

  const [search, setSearch] = useState("");

  // Dialog & Form State
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingSurveyId, setEditingSurveyId] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    projectId: "",
    supplierId: "",
    baseSupplierUrl: "",
    status: "active",
  });

  const [rules, setRules] = useState<{ key: string; value: string }[]>([]);
  const [vendorLinks, setVendorLinks] = useState<{ vendorId: string; quota: number; hash: string }[]>([]);

  // Fast add states
  const [newSupplierName, setNewSupplierName] = useState("");
  const [isAddingSupplier, setIsAddingSupplier] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorPostback, setNewVendorPostback] = useState("");
  const [isAddingVendor, setIsAddingVendor] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [surveysRes, suppliersRes, vendorsRes] = await Promise.all([
        api.get('/api/admin/surveys'),
        api.get('/api/admin/surveys/suppliers'),
        api.get('/api/admin/surveys/vendors')
      ]);
      setSurveys(surveysRes.data);
      setSuppliers(suppliersRes.data);
      setVendors(vendorsRes.data);
    } catch (error) {
      showToast("Failed to fetch surveys", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenCreate = () => {
    setEditingSurveyId(null);
    setFormData({
      name: "",
      projectId: "",
      supplierId: "",
      baseSupplierUrl: "",
      status: "active",
    });
    setRules([]);
    setVendorLinks([]);
    setIsDialogOpen(true);
  };

  const handleOpenEdit = (survey: Survey) => {
    setEditingSurveyId(survey._id);
    setFormData({
      name: survey.name,
      projectId: survey.projectId,
      supplierId: survey.supplierId?._id || "",
      baseSupplierUrl: survey.baseSupplierUrl,
      status: survey.status,
    });
    
    // Convert rules object to array
    const rulesArr = survey.eligibilityRules 
      ? Object.entries(survey.eligibilityRules).map(([key, value]) => ({ key, value }))
      : [];
    setRules(rulesArr);
    
    // Map vendor links
    const linksArr = survey.vendorLinks.map(vl => ({
      vendorId: vl.vendorId?._id || "",
      quota: vl.quota || 0,
      hash: vl.hash || ""
    }));
    setVendorLinks(linksArr);
    
    setIsDialogOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this survey?")) return;
    try {
      await api.delete(`/api/admin/surveys/${id}`);
      showToast("Survey deleted", "success");
      fetchData();
    } catch (error) {
      showToast("Failed to delete survey", "error");
    }
  };

  const handleCreateSupplier = async () => {
    if (!newSupplierName.trim()) return;
    try {
      const res = await api.post('/api/admin/surveys/suppliers', { name: newSupplierName, isActive: true });
      setSuppliers([res.data, ...suppliers]);
      setFormData({ ...formData, supplierId: res.data._id });
      setNewSupplierName("");
      setIsAddingSupplier(false);
      showToast("Supplier created", "success");
    } catch (error) {
      showToast("Failed to create supplier", "error");
    }
  };

  const handleCreateVendor = async () => {
    if (!newVendorName.trim()) return;
    try {
      const res = await api.post('/api/admin/surveys/vendors', { 
        name: newVendorName.trim(), 
        postbackUrl: newVendorPostback.trim() || undefined,
        isActive: true 
      });
      setVendors([res.data, ...vendors]);
      setNewVendorName("");
      setNewVendorPostback("");
      setIsAddingVendor(false);
      showToast("Vendor created successfully", "success");
    } catch (error) {
      showToast("Failed to create vendor", "error");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Convert rules array back to object
    const eligibilityRules: Record<string, string> = {};
    rules.forEach(r => {
      if (r.key.trim() && r.value.trim()) {
        eligibilityRules[r.key.trim()] = r.value.trim();
      }
    });

    const payload = {
      ...formData,
      eligibilityRules,
      vendorLinks: vendorLinks.filter(vl => vl.vendorId)
    };

    try {
      if (editingSurveyId) {
        await api.put(`/api/admin/surveys/${editingSurveyId}`, payload);
        showToast("Survey updated successfully", "success");
      } else {
        await api.post('/api/admin/surveys', payload);
        showToast("Survey created successfully", "success");
      }
      setIsDialogOpen(false);
      fetchData();
    } catch (error: any) {
      showToast(error.response?.data?.message || "Operation failed", "error");
    }
  };

  const filteredSurveys = surveys.filter(s => 
    (s.name || "").toLowerCase().includes(search.toLowerCase()) || 
    (s.projectId || "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Surveys</h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm">
            Manage your upstream surveys and routing rules.
          </p>
        </div>
        <Button onClick={handleOpenCreate} className="gap-2 bg-slate-900 text-slate-50 hover:bg-slate-900/90 dark:bg-emerald-500 dark:text-white dark:hover:bg-emerald-600">
          <PlusCircle className="h-4 w-4" />
          Create Survey
        </Button>
      </div>

      <div className="flex items-center gap-2">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-500" />
          <Input 
            placeholder="Search surveys by name or ID..." 
            className="pl-9 bg-white dark:bg-slate-950" 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border bg-white dark:bg-slate-950 dark:border-slate-800 shadow-sm overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50/50 dark:bg-slate-900/50">
              <TableHead className="font-semibold">Survey Name</TableHead>
              <TableHead className="font-semibold">Project ID</TableHead>
              <TableHead className="font-semibold hidden sm:table-cell">Supplier</TableHead>
              <TableHead className="font-semibold">Status</TableHead>
              <TableHead className="font-semibold hidden md:table-cell">Created</TableHead>
              <TableHead className="font-semibold text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell className="hidden sm:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-6 w-16 rounded-full" /></TableCell>
                  <TableCell className="hidden md:table-cell"><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell className="text-right"><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                </TableRow>
              ))
            ) : filteredSurveys.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="h-32 text-center text-slate-500">
                  No surveys found.
                </TableCell>
              </TableRow>
            ) : (
              filteredSurveys.map(survey => (
                <TableRow key={survey._id} className="group">
                  <TableCell className="font-medium text-slate-900 dark:text-slate-100">
                    {survey.name}
                  </TableCell>
                  <TableCell className="font-mono text-sm text-slate-500">{survey.projectId}</TableCell>
                  <TableCell className="hidden sm:table-cell text-slate-600 dark:text-slate-400">
                    {survey.supplierId?.name || <span className="text-slate-400 italic">None</span>}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className={
                      survey.status === 'active' ? "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-400 dark:border-emerald-500/20" :
                      survey.status === 'paused' ? "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-400 dark:border-amber-500/20" :
                      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700"
                    }>
                      {survey.status.charAt(0).toUpperCase() + survey.status.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell className="hidden md:table-cell text-sm text-slate-500">
                    {new Date(survey.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="View Links" asChild className="h-8 w-8 text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400">
                        <Link href={`/admin/surveys/${survey._id}`}>
                          <LinkIcon className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" title="Edit" onClick={() => handleOpenEdit(survey)} className="h-8 w-8 text-slate-500 hover:text-blue-600 dark:hover:text-blue-400">
                        <Edit2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Delete" onClick={() => handleDelete(survey._id)} className="h-8 w-8 text-slate-500 hover:text-red-600 dark:hover:text-red-400">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-slate-950 border-slate-200 dark:border-slate-800">
          <DialogHeader>
            <DialogTitle className="text-xl">{editingSurveyId ? "Edit Survey" : "Create New Survey"}</DialogTitle>
            <DialogDescription>
              Configure your survey routing rules, quotas, and vendor links.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Survey Name</label>
                <Input 
                  required 
                  value={formData.name} 
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. US Tech B2B" 
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Project ID</label>
                <Input 
                  required 
                  value={formData.projectId} 
                  onChange={e => setFormData({ ...formData, projectId: e.target.value })}
                  placeholder="e.g. PROJ-2026-X" 
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Supplier</label>
                {!isAddingSupplier ? (
                  <div className="flex gap-2">
                    <Select value={formData.supplierId} onValueChange={v => setFormData({ ...formData, supplierId: v })}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a supplier" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map(sup => (
                          <SelectItem key={sup._id} value={sup._id}>{sup.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button type="button" variant="outline" size="icon" onClick={() => setIsAddingSupplier(true)} title="Add New Supplier">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input 
                      placeholder="Supplier Name" 
                      value={newSupplierName} 
                      onChange={e => setNewSupplierName(e.target.value)} 
                      autoFocus
                    />
                    <Button type="button" onClick={handleCreateSupplier} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save</Button>
                    <Button type="button" variant="ghost" onClick={() => setIsAddingSupplier(false)}><X className="h-4 w-4" /></Button>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Status</label>
                <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="paused">Paused</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Base Supplier URL</label>
              <Input 
                required 
                value={formData.baseSupplierUrl} 
                onChange={e => setFormData({ ...formData, baseSupplierUrl: e.target.value })}
                placeholder="https://supplier.com/route?pid=X&uid=[identifier]" 
              />
              <p className="text-xs text-slate-500">Include <code className="bg-slate-100 dark:bg-slate-800 px-1 py-0.5 rounded">[identifier]</code> where the transaction token should be appended.</p>
            </div>

            {/* Eligibility Rules */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2"><Settings className="h-4 w-4 text-emerald-500" /> Eligibility Rules</h3>
                <Button type="button" variant="outline" size="sm" onClick={() => setRules([...rules, { key: "", value: "" }])}>
                  <Plus className="h-3 w-3 mr-1" /> Add Rule
                </Button>
              </div>
              {rules.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No rules defined. All traffic will qualify.</p>
              ) : (
                <div className="space-y-2">
                  {rules.map((rule, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <Input 
                        placeholder="Field (e.g. gender)" 
                        value={rule.key} 
                        onChange={e => {
                          const n = [...rules]; n[idx].key = e.target.value; setRules(n);
                        }}
                        className="flex-1"
                      />
                      <span className="text-slate-400">=</span>
                      <Input 
                        placeholder="Value (e.g. Male)" 
                        value={rule.value} 
                        onChange={e => {
                          const n = [...rules]; n[idx].value = e.target.value; setRules(n);
                        }}
                        className="flex-1"
                      />
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                        setRules(rules.filter((_, i) => i !== idx));
                      }}>
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Vendor Links */}
            <div className="bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-800 rounded-lg p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold flex items-center gap-2"><LinkIcon className="h-4 w-4 text-indigo-500" /> Vendor Links</h3>
                <div className="flex gap-2">
                  {!isAddingVendor && (
                    <Button type="button" variant="outline" size="sm" onClick={() => setIsAddingVendor(true)} title="Create New Vendor">
                      <Plus className="h-3 w-3 mr-1" /> Create Vendor
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={() => setVendorLinks([...vendorLinks, { vendorId: "", quota: 0, hash: "" }])}>
                    <Plus className="h-3 w-3 mr-1" /> Link Vendor
                  </Button>
                </div>
              </div>

              {isAddingVendor && (
                <div className="bg-white dark:bg-slate-950 p-3 rounded-lg border border-slate-200 dark:border-slate-800 space-y-3 shadow-sm">
                  <div className="text-xs font-semibold text-slate-800 dark:text-slate-200">Create New Vendor</div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input 
                      placeholder="Vendor Name" 
                      value={newVendorName} 
                      onChange={e => setNewVendorName(e.target.value)} 
                    />
                    <Input 
                      placeholder="Postback URL (optional)" 
                      value={newVendorPostback} 
                      onChange={e => setNewVendorPostback(e.target.value)} 
                    />
                  </div>
                  <div className="flex justify-end gap-2 text-xs">
                    <Button type="button" variant="ghost" size="sm" onClick={() => {
                      setIsAddingVendor(false);
                      setNewVendorName("");
                      setNewVendorPostback("");
                    }}>Cancel</Button>
                    <Button type="button" size="sm" onClick={handleCreateVendor} className="bg-emerald-600 hover:bg-emerald-700 text-white">Save Vendor</Button>
                  </div>
                </div>
              )}
              {vendorLinks.length === 0 ? (
                <p className="text-xs text-slate-500 italic">No vendors linked. Add a vendor to generate a secure routing link.</p>
              ) : (
                <div className="space-y-2">
                  <div className="flex gap-2 px-1 text-xs font-medium text-slate-500">
                    <div className="flex-[2]">Vendor</div>
                    <div className="flex-1">Quota</div>
                    {editingSurveyId && <div className="flex-1">Hash</div>}
                    <div className="w-8"></div>
                  </div>
                  {vendorLinks.map((link, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <div className="flex-[2]">
                        <Select 
                          value={link.vendorId} 
                          onValueChange={v => {
                            const n = [...vendorLinks]; n[idx].vendorId = v; setVendorLinks(n);
                          }}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Select Vendor" />
                          </SelectTrigger>
                          <SelectContent>
                            {vendors.map(v => (
                              <SelectItem key={v._id} value={v._id}>{v.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <div className="flex-1">
                        <Input 
                          type="number" 
                          min={0}
                          value={link.quota} 
                          onChange={e => {
                            const n = [...vendorLinks]; n[idx].quota = Number(e.target.value); setVendorLinks(n);
                          }}
                        />
                      </div>
                      {editingSurveyId && (
                        <div className="flex-1">
                           <Input value={link.hash} disabled className="font-mono text-xs bg-slate-100 dark:bg-slate-800" />
                        </div>
                      )}
                      <Button type="button" variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => {
                        setVendorLinks(vendorLinks.filter((_, i) => i !== idx));
                      }}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <DialogFooter className="pt-4 border-t dark:border-slate-800">
              <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white">
                {editingSurveyId ? "Save Changes" : "Create Survey"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
