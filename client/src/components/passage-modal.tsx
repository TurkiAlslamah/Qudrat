import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { Save } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { Passage, InsertPassage } from "@shared/schema";

const passageSchema = z.object({
  passageTitle: z.string().optional(),
  passageImage: z.string().url("Please enter a valid image URL"),
  status: z.enum(["draft", "active", "inactive"]),
});

type PassageFormData = z.infer<typeof passageSchema>;

interface PassageModalProps {
  open: boolean;
  onClose: () => void;
  passage?: Passage | null;
  mode: 'create' | 'edit';
}

const PassageModal = ({ open, onClose, passage, mode }: PassageModalProps) => {
  const { toast } = useToast();

  const form = useForm<PassageFormData>({
    resolver: zodResolver(passageSchema),
    defaultValues: {
      passageTitle: "",
      passageImage: "",
      status: "draft",
    },
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: InsertPassage) => {
      if (mode === 'edit' && passage) {
        return apiRequest('PUT', `/api/passages/${passage.passageId}`, data);
      } else {
        return apiRequest('POST', '/api/passages', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/passages'] });
      toast({
        title: "Success",
        description: `Passage ${mode === 'edit' ? 'updated' : 'created'} successfully`,
      });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Reset form when passage changes
  useEffect(() => {
    if (passage && mode === 'edit') {
      form.reset({
        passageTitle: passage.passageTitle || "",
        passageImage: passage.passageImage,
        status: passage.status as "draft" | "active" | "inactive",
      });
    } else if (mode === 'create') {
      form.reset({
        passageTitle: "",
        passageImage: "",
        status: "draft",
      });
    }
  }, [passage, mode, form]);

  const onSubmit = (data: PassageFormData) => {
    const submitData: InsertPassage = {
      passageTitle: data.passageTitle || null,
      passageImage: data.passageImage,
      status: data.status,
    };
    
    saveMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Passage' : 'Add New Passage'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Title */}
            <FormField
              control={form.control}
              name="passageTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passage Title (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., نص قراءة عن البيئة"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Image URL */}
            <FormField
              control={form.control}
              name="passageImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passage Image URL</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/passage-image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-secondary-500">
                    Enter the direct URL to the passage image (JPG, PNG, etc.)
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Status */}
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Preview Image */}
            {form.watch('passageImage') && (
              <div className="space-y-2">
                <label className="block text-sm font-medium text-secondary-700">
                  Image Preview
                </label>
                <div className="border border-secondary-300 rounded-lg p-4 bg-secondary-50">
                  <img 
                    src={form.watch('passageImage')} 
                    alt="Passage preview"
                    className="max-w-full h-auto max-h-64 mx-auto rounded"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
              </div>
            )}

            {/* Modal Footer */}
            <div className="flex items-center justify-end space-x-3 pt-6 border-t border-secondary-200">
              <Button 
                type="button" 
                variant="outline"
                onClick={onClose}
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={saveMutation.isPending}
                className="bg-primary-600 hover:bg-primary-700"
              >
                <Save className="mr-2 h-4 w-4" />
                {saveMutation.isPending ? 'Saving...' : 'Save Passage'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default PassageModal;