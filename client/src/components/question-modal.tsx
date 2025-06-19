import { useState, useEffect } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
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
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import type { QuestionDetails, InsertQuestion } from "@shared/schema";

const questionSchema = z.object({
  questionTitle: z.string().optional(),
  questionText: z.string().min(1, "Question text is required"),
  questionImage: z.string().url().optional().or(z.literal("")),
  mcA: z.string().min(1, "Option A is required"),
  mcB: z.string().min(1, "Option B is required"),
  mcC: z.string().min(1, "Option C is required"),
  mcD: z.string().min(1, "Option D is required"),
  mcCorrect: z.enum(["A", "B", "C", "D"], { required_error: "Please select the correct answer" }),
  typeId: z.coerce.number().min(1, "Please select a question type"),
  internalTypeId: z.coerce.number().min(1, "Please select an internal type"),
  passageId: z.coerce.number().optional(),
  questionOrder: z.coerce.number().min(1).default(1),
  explanationImage: z.string().url().optional().or(z.literal("")),
  hintImage: z.string().url().optional().or(z.literal("")),
  tags: z.string().optional(),
  status: z.enum(["draft", "active", "inactive"]),
});

type QuestionFormData = z.infer<typeof questionSchema>;

interface QuestionModalProps {
  open: boolean;
  onClose: () => void;
  question?: QuestionDetails | null;
  mode: 'create' | 'edit';
}

const QuestionModal = ({ open, onClose, question, mode }: QuestionModalProps) => {
  const { toast } = useToast();

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionTitle: "",
      questionText: "",
      questionImage: "",
      mcA: "",
      mcB: "",
      mcC: "",
      mcD: "",
      mcCorrect: "A",
      typeId: 0,
      internalTypeId: 0,
      passageId: 0,
      questionOrder: 1,
      explanationImage: "",
      hintImage: "",
      tags: "",
      status: "draft",
    },
  });

  // Fetch question types
  const { data: questionTypes = [] } = useQuery({
    queryKey: ['/api/question-types'],
    enabled: open,
  });

  // Fetch internal types based on selected type
  const selectedTypeId = form.watch('typeId');
  const { data: internalTypes = [] } = useQuery({
    queryKey: ['/api/internal-types', selectedTypeId],
    queryFn: () => apiRequest('GET', `/api/internal-types?typeId=${selectedTypeId}`),
    enabled: open && selectedTypeId > 0,
  });

  // Fetch passages
  const { data: passages = [] } = useQuery({
    queryKey: ['/api/passages'],
    enabled: open,
  });

  // Create/Update mutation
  const saveMutation = useMutation({
    mutationFn: async (data: InsertQuestion) => {
      if (mode === 'edit' && question) {
        return apiRequest('PUT', `/api/questions/${question.qNo}`, data);
      } else {
        return apiRequest('POST', '/api/questions', data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/questions'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      toast({
        title: "Success",
        description: `Question ${mode === 'edit' ? 'updated' : 'created'} successfully`,
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

  // Reset form when question changes
  useEffect(() => {
    if (question && mode === 'edit') {
      form.reset({
        questionTitle: question.questionTitle || "",
        questionText: question.questionText,
        questionImage: question.questionImage || "",
        mcA: question.mcA,
        mcB: question.mcB,
        mcC: question.mcC,
        mcD: question.mcD,
        mcCorrect: question.mcCorrect as "A" | "B" | "C" | "D",
        typeId: question.typeId,
        internalTypeId: question.internalTypeId,
        passageId: question.passageId || 0,
        questionOrder: question.questionOrder || 1,
        explanationImage: question.explanationImage || "",
        hintImage: question.hintImage || "",
        tags: Array.isArray(question.tags) ? question.tags.join(", ") : (question.tags || ""),
        status: question.status as "draft" | "active" | "inactive",
      });
    } else if (mode === 'create') {
      form.reset({
        questionTitle: "",
        questionText: "",
        questionImage: "",
        mcA: "",
        mcB: "",
        mcC: "",
        mcD: "",
        mcCorrect: "A",
        typeId: 0,
        internalTypeId: 0,
        passageId: 0,
        questionOrder: 1,
        explanationImage: "",
        hintImage: "",
        tags: "",
        status: "draft",
      });
    }
  }, [question, mode, form]);

  const onSubmit = (data: QuestionFormData) => {
    const submitData: InsertQuestion = {
      questionTitle: data.questionTitle || null,
      questionText: data.questionText,
      questionImage: data.questionImage || null,
      mcA: data.mcA,
      mcB: data.mcB,
      mcC: data.mcC,
      mcD: data.mcD,
      mcCorrect: data.mcCorrect,
      typeId: data.typeId,
      internalTypeId: data.internalTypeId,
      passageId: data.passageId || null,
      questionOrder: data.questionOrder || 1,
      explanationImage: data.explanationImage || null,
      hintImage: data.hintImage || null,
      tags: data.tags ? data.tags.split(",").map(tag => tag.trim()).filter(Boolean) : [],
      status: data.status,
    };
    
    saveMutation.mutate(submitData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {mode === 'edit' ? 'Edit Question' : 'Add New Question'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            
            {/* Title */}
            <FormField
              control={form.control}
              name="questionTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Title (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., سؤال في الفهم والاستيعاب"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Text */}
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Enter the question text here..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Image URL */}
            <FormField
              control={form.control}
              name="questionImage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Image URL (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="https://example.com/question-image.jpg"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Multiple Choice Options */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="mcA"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option A *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter option A" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcB"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option B *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter option B" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option C *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter option C" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mcD"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Option D *</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Enter option D" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Correct Answer */}
            <FormField
              control={form.control}
              name="mcCorrect"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Correct Answer *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select the correct answer" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="A">A</SelectItem>
                      <SelectItem value="B">B</SelectItem>
                      <SelectItem value="C">C</SelectItem>
                      <SelectItem value="D">D</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Type Selection */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type *</FormLabel>
                    <Select onValueChange={(value) => {
                      field.onChange(Number(value));
                      form.setValue('internalTypeId', 0); // Reset internal type
                    }} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {questionTypes.map((type: any) => (
                          <SelectItem key={type.typeId} value={type.typeId.toString()}>
                            {type.typeName} ({type.typeNameEn})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="internalTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Type *</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(Number(value))} 
                      value={field.value?.toString()}
                      disabled={!selectedTypeId || selectedTypeId === 0}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Internal Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {internalTypes.map((type: any) => (
                          <SelectItem key={type.internalTypeId} value={type.internalTypeId.toString()}>
                            {type.internalName}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Passage Selection */}
            <FormField
              control={form.control}
              name="passageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Passage (Optional)</FormLabel>
                  <Select onValueChange={(value) => field.onChange(Number(value))} value={field.value?.toString()}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select Passage (if applicable)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="0">No Passage</SelectItem>
                      {passages.map((passage: any) => (
                        <SelectItem key={passage.passageId} value={passage.passageId.toString()}>
                          {passage.passageTitle || `Passage ${passage.passageId}`}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Additional Fields */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="questionOrder"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Order</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        min="1"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
            </div>

            {/* Image URLs */}
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="explanationImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Explanation Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/explanation.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hintImage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hint Image URL</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://example.com/hint.jpg"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags (comma-separated)</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., geometry, algebra, intermediate"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-secondary-500">
                    Separate multiple tags with commas
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                {saveMutation.isPending ? 'Saving...' : 'Save Question'}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default QuestionModal;