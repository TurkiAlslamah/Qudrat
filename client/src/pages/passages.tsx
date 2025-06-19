import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Plus, Search, Edit, Trash2, Eye, Download } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import PassageModal from "@/components/passage-modal";
import type { Passage } from "@shared/schema";

const Passages = () => {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [passageToDelete, setPassageToDelete] = useState<number | null>(null);
  const [isPassageModalOpen, setIsPassageModalOpen] = useState(false);
  const [selectedPassage, setSelectedPassage] = useState<Passage | null>(null);
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create');

  // Load passages
  const { data: passages = [], isLoading } = useQuery<Passage[]>({
    queryKey: ['/api/passages'],
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async (passageId: number) => {
      return apiRequest('DELETE', `/api/passages/${passageId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passages'] });
      toast({
        title: "Success",
        description: "Passage deleted successfully",
      });
      setDeleteDialogOpen(false);
      setPassageToDelete(null);
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleDeletePassage = (passageId: number) => {
    setPassageToDelete(passageId);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (passageToDelete) {
      deleteMutation.mutate(passageToDelete);
    }
  };

  const handleAddPassage = () => {
    setSelectedPassage(null);
    setModalMode('create');
    setIsPassageModalOpen(true);
  };

  const handleEditPassage = (passage: Passage) => {
    setSelectedPassage(passage);
    setModalMode('edit');
    setIsPassageModalOpen(true);
  };

  const closeModal = () => {
    setIsPassageModalOpen(false);
    setSelectedPassage(null);
  };

  const handleViewPassage = (passage: Passage) => {
    // Open passage image in new tab
    if (passage.passageImage) {
      window.open(passage.passageImage, '_blank');
    }
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: "bg-green-100 text-green-800",
      draft: "bg-yellow-100 text-yellow-800",
      inactive: "bg-red-100 text-red-800"
    };
    
    return variants[status as keyof typeof variants] || variants.draft;
  };

  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "Yesterday";
    return `${diffDays} days ago`;
  };

  const filteredPassages = passages.filter(passage =>
    passage.passageTitle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <>
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-secondary-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-secondary-900">Passages Management</h1>
            <nav className="flex" aria-label="Breadcrumb">
              <ol className="flex items-center space-x-2">
                <li>
                  <span className="text-secondary-500 text-sm">Home</span>
                </li>
                <li>
                  <span className="text-secondary-400 text-xs mx-2">/</span>
                  <span className="text-secondary-900 text-sm font-medium">Passages</span>
                </li>
              </ol>
            </nav>
          </div>
          
          <div className="flex items-center space-x-4">
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Export
            </Button>
            
            <Button onClick={handleAddPassage} className="bg-primary-600 hover:bg-primary-700">
              <Plus className="mr-2 h-4 w-4" />
              Add Passage
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto bg-secondary-50">
        <div className="p-6 space-y-6">
          
          {/* Search and Stats */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search */}
            <Card className="bg-white border border-secondary-200 lg:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg font-semibold text-secondary-900">
                  Search Passages
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-secondary-400 h-4 w-4" />
                  <Input
                    type="text"
                    placeholder="Search by title..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Quick Stats */}
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-3 gap-4">
              <Card className="bg-white border border-secondary-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-secondary-900">{passages.length}</p>
                    <p className="text-sm text-secondary-600">Total Passages</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-secondary-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {passages.filter(p => p.status === 'active').length}
                    </p>
                    <p className="text-sm text-secondary-600">Active</p>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border border-secondary-200">
                <CardContent className="p-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-yellow-600">
                      {passages.filter(p => p.status === 'draft').length}
                    </p>
                    <p className="text-sm text-secondary-600">Drafts</p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Passages Table */}
          <Card className="bg-white border border-secondary-200">
            <CardHeader>
              <CardTitle className="text-lg font-semibold text-secondary-900">
                All Passages
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-16 bg-secondary-200 rounded animate-pulse" />
                  ))}
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Passage</TableHead>
                        <TableHead>Difficulty</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredPassages.map((passage) => (
                        <TableRow key={passage.passageId} className="hover:bg-secondary-50">
                          <TableCell>
                            <div className="flex items-start space-x-3">
                              <div className="w-12 h-12 bg-secondary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                                <Eye className="text-secondary-600 h-5 w-5" />
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="text-sm font-medium text-secondary-900 truncate">
                                  {passage.passageTitle || `Passage #${passage.passageId}`}
                                </p>
                                <p className="text-xs text-secondary-500">
                                  ID: {passage.passageId}
                                </p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <div className="difficulty-bar w-16">
                                <div 
                                  className={`difficulty-fill ${
                                    parseFloat(passage.avgDifficulty || "0") >= 70 ? 'difficulty-easy' :
                                    parseFloat(passage.avgDifficulty || "0") >= 40 ? 'difficulty-medium' : 'difficulty-hard'
                                  }`}
                                  style={{ width: `${passage.avgDifficulty || 0}%` }}
                                />
                              </div>
                              <span className="text-sm font-medium text-secondary-900">
                                {passage.avgDifficulty || 0}%
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={getStatusBadge(passage.status || 'draft')}>
                              {passage.status || 'draft'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-secondary-600">
                              {passage.createdAt ? formatTimeAgo(passage.createdAt.toString()) : 'Unknown'}
                            </span>
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex items-center justify-end space-x-2">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleViewPassage(passage)}
                                className="text-blue-600 hover:text-blue-700"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleEditPassage(passage)}
                                className="text-primary-600 hover:text-primary-700"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeletePassage(passage.passageId)}
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                  
                  {filteredPassages.length === 0 && (
                    <div className="text-center py-8">
                      <p className="text-secondary-500">No passages found</p>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Passage Modal */}
      <PassageModal
        open={isPassageModalOpen}
        onClose={closeModal}
        passage={selectedPassage}
        mode={modalMode}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the passage
              and all associated questions.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={deleteMutation.isPending}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteMutation.isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default Passages;
