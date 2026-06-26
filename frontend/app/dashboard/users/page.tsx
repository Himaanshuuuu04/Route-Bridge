"use client";

import { useState } from "react";
import { useToast } from "@/app/context/ToastContext";
import { 
  useGetAdminUsersQuery, 
  useToggleUserAdminStatusMutation, 
  useGetMeQuery,
  useCreateAdminUserMutation,
  useDeleteAdminUserMutation
} from "@/app/store/apiSlice";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Shield, ShieldAlert, User, Check, Plus, Trash2, Loader2 } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function UsersPage() {
  const { showToast } = useToast();
  const { data: currentUser, isLoading: isCurrentUserLoading } = useGetMeQuery();
  const { data: users = [], isLoading } = useGetAdminUsersQuery(undefined, {
    skip: !currentUser?.surveyAdmin,
  });
  
  const [toggleAdminStatus] = useToggleUserAdminStatusMutation();
  const [createAdminUser] = useCreateAdminUserMutation();
  const [deleteAdminUser] = useDeleteAdminUserMutation();
  
  const [loadingIds, setLoadingIds] = useState<Set<string>>(new Set());
  
  // Add User Modal State
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [isAdding, setIsAdding] = useState(false);

  // Delete User State
  const [deletingId, setDeletingId] = useState<string | null>(null);

  if (!isCurrentUserLoading && !currentUser?.surveyAdmin) {
    return (
      <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 relative z-10 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-white mb-2">Access Denied</h2>
          <p className="text-zinc-400">You must be a superadmin to view this page.</p>
        </div>
      </main>
    );
  }

  const handleToggleAdmin = async (id: string, currentStatus: boolean) => {
    if (id === currentUser?._id) {
      showToast("You cannot change your own admin status.", "error");
      return;
    }
    
    const action = currentStatus ? "remove" : "grant";
    if (!confirm(`Are you sure you want to ${action} superadmin privileges for this user?`)) return;

    setLoadingIds((prev) => new Set(prev).add(id));
    try {
      await toggleAdminStatus(id).unwrap();
      showToast(`Superadmin privileges ${currentStatus ? "removed" : "granted"} successfully.`, "success");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to update user admin status.", "error");
    } finally {
      setLoadingIds((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newUserName || !newUserEmail) return;

    setIsAdding(true);
    try {
      await createAdminUser({ name: newUserName, email: newUserEmail }).unwrap();
      showToast("User added successfully.", "success");
      setIsAddUserOpen(false);
      setNewUserName("");
      setNewUserEmail("");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to add user.", "error");
    } finally {
      setIsAdding(false);
    }
  };

  const handleDeleteUser = async (id: string) => {
    if (id === currentUser?._id) {
      showToast("You cannot delete your own account.", "error");
      return;
    }
    if (!confirm("Are you sure you want to delete this user? This action cannot be undone.")) return;

    setDeletingId(id);
    try {
      await deleteAdminUser(id).unwrap();
      showToast("User deleted successfully.", "success");
    } catch (error: any) {
      showToast(error?.data?.message || "Failed to delete user.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="flex-1 overflow-y-auto overflow-x-hidden p-4 sm:p-6 md:p-10 relative z-10">
      <motion.div 
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="w-full max-w-5xl mx-auto"
      >
        <Card className="bg-black/40 border-white/10 backdrop-blur-xl shadow-2xl flex flex-col h-full w-full overflow-hidden">
          <CardHeader className="pb-6 border-b border-white/5 flex flex-row items-center justify-between">
            <CardTitle className="text-xl font-bold text-white flex items-center gap-2">
              <User className="h-5 w-5 text-emerald-400" /> Manage Users
            </CardTitle>
            <Button 
              onClick={() => setIsAddUserOpen(true)}
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium"
            >
              <Plus className="mr-2 h-4 w-4" /> Add User
            </Button>
          </CardHeader>
          <CardContent className="flex-1 p-0 overflow-x-auto">
            <Table>
              <TableHeader className="bg-white/[0.02]">
                <TableRow className="border-white/5 hover:bg-transparent">
                  <TableHead className="font-semibold text-zinc-400 pl-6 py-4">Name</TableHead>
                  <TableHead className="font-semibold text-zinc-400">Email</TableHead>
                  <TableHead className="font-semibold text-zinc-400">Role</TableHead>
                  <TableHead className="font-semibold text-zinc-400">Joined</TableHead>
                  <TableHead className="font-semibold text-zinc-400 text-right pr-6">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <AnimatePresence mode="popLayout">
                  {isLoading ? (
                    Array.from({ length: 5 }).map((_, i) => (
                      <TableRow key={`skeleton-${i}`} className="border-white/5">
                        <TableCell className="pl-6"><Skeleton className="h-5 w-32 bg-white/5 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-48 bg-white/5 rounded-md" /></TableCell>
                        <TableCell><Skeleton className="h-6 w-24 bg-white/5 rounded-full" /></TableCell>
                        <TableCell><Skeleton className="h-5 w-24 bg-white/5 rounded-md" /></TableCell>
                        <TableCell className="text-right pr-6"><Skeleton className="h-8 w-24 ml-auto bg-white/5 rounded-md" /></TableCell>
                      </TableRow>
                    ))
                  ) : users.length === 0 ? (
                    <TableRow className="border-none">
                      <TableCell colSpan={5} className="h-32 text-center text-zinc-500 font-medium">
                        No users found.
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user, index) => {
                      const isSelf = user._id === currentUser?._id;
                      const isToggling = loadingIds.has(user._id);
                      const isDeleting = deletingId === user._id;
                      
                      return (
                        <motion.tr 
                          key={user._id} 
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0 }}
                          transition={{ delay: index * 0.05 }}
                          className="group transition-colors border-white/5 hover:bg-white/[0.02]"
                        >
                          <TableCell className="font-medium text-white pl-6">
                            {user.name} {isSelf && <span className="text-zinc-500 text-xs ml-2">(You)</span>}
                          </TableCell>
                          <TableCell className="text-zinc-400">{user.email}</TableCell>
                          <TableCell>
                            {user.surveyAdmin ? (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                                <Shield className="mr-1 h-3 w-3" /> Superadmin
                              </div>
                            ) : (
                              <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-500/10 text-zinc-400 border border-zinc-500/20">
                                <User className="mr-1 h-3 w-3" /> User
                              </div>
                            )}
                          </TableCell>
                          <TableCell className="text-sm text-zinc-400">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </TableCell>
                          <TableCell className="text-right pr-6">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm" 
                                disabled={isSelf || isToggling || isDeleting}
                                onClick={() => handleToggleAdmin(user._id, user.surveyAdmin)}
                                className={`h-8 border-white/10 ${user.surveyAdmin ? 'hover:bg-amber-500/20 hover:text-amber-400 hover:border-amber-500/30 text-amber-400/80 bg-amber-500/5' : 'hover:bg-emerald-500/20 hover:text-emerald-400 hover:border-emerald-500/30 text-emerald-400/80 bg-emerald-500/5'}`}
                              >
                                {isToggling ? <Loader2 className="h-4 w-4 animate-spin" /> : user.surveyAdmin ? (
                                  <><ShieldAlert className="mr-2 h-3.5 w-3.5" /> Revoke</>
                                ) : (
                                  <><Check className="mr-2 h-3.5 w-3.5" /> Make Admin</>
                                )}
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                disabled={isSelf || isToggling || isDeleting}
                                onClick={() => handleDeleteUser(user._id)}
                                className="h-8 border-white/10 hover:bg-red-500/20 hover:text-red-400 hover:border-red-500/30 text-red-400/80 bg-red-500/5 px-2"
                                title="Delete User"
                              >
                                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                              </Button>
                            </div>
                          </TableCell>
                        </motion.tr>
                      );
                    })
                  )}
                </AnimatePresence>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </motion.div>

      <Dialog open={isAddUserOpen} onOpenChange={setIsAddUserOpen}>
        <DialogContent className="bg-zinc-950 border border-white/10 text-white sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleAddUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-zinc-400">Full Name</Label>
              <Input 
                id="name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="John Doe"
                required
                className="bg-black/50 border-white/10 text-white focus-visible:ring-emerald-500"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-400">Email Address</Label>
              <Input 
                id="email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="john@example.com"
                required
                className="bg-black/50 border-white/10 text-white focus-visible:ring-emerald-500"
              />
            </div>
            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => setIsAddUserOpen(false)} className="border-white/10 bg-transparent text-white hover:bg-white/5">
                Cancel
              </Button>
              <Button type="submit" disabled={isAdding} className="bg-emerald-500 hover:bg-emerald-600 text-white">
                {isAdding ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...</> : 'Add User'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </main>
  );
}
