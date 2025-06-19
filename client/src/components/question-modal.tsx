import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { X, Save } from "lucide-react";
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
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import FileUpload from "./file-upload";
import type { QuestionDetails, InsertQuestion } from "@shared/schema";

const questionSchema = z.object({
  questionTitle: z.string().optional(),
  questionText: z.string().min(1, "Question text is required"),
  typeId: z.number().min(1, "Question type is required"),
  internalTypeId: z.number().min(1, "Internal type is required"),
  mcA: z.string().min(1, "Option A is required"),
  mcB: z.string().min(1, "Option B is required"),
  mcC: z.string().min(1, "Option C is required"),
  mcD: z.string().min(1, "Option D is required"),
  mcCorrect: z.enum(["A", "B", "C", "D"]),
  status: z.enum(["draft", "active", "inactive", "under_review"]),
  tags: z.string().optional(),
  passageId: z.number().optional(),
  questionOrder: z.number().optional(),
  questionImage: z.string().optional(),
  explanationImage: z.string().optional(),
  hintImage: z.string().optional(),
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
  const [selectedTypeId, setSelectedTypeId] = useState<number | null>(null);

  const form = useForm<QuestionFormData>({
    resolver: zodResolver(questionSchema),
    defaultValues: {
      questionTitle: "",
      questionText: "",
      typeId: 0,
      internalTypeId: 0,
      mcA: "",
      mcB: "",
      mcC: "",
      mcD: "",
      mcCorrect: "A",
      status: "draft",
      tags: "",
      questionOrder: 1,
    },
  });

  // Load question types
  const { data: questionTypes = [] } = useQuery({
    queryKey: ['/api/question-types'],
  });

  // Load internal types based on selected type
  const { data: internalTypes = [] } = useQuery({
    queryKey: ['/api/internal-types', selectedTypeId],
    enabled: !!selectedTypeId,
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
        typeId: question.typeId,
        internalTypeId: question.internalTypeId,
        mcA: question.mcA,
        mcB: question.mcB,
        mcC: question.mcC,
        mcD: question.mcD,
        mcCorrect: question.mcCorrect as "A" | "B" | "C" | "D",
        status: question.status as "draft" | "active" | "inactive" | "under_review",
        tags: question.tags || "",
        passageId: question.passageId || undefined,
        questionOrder: question.questionOrder || 1,
        questionImage: question.questionImage || "",
        explanationImage: question.explanationImage || "",
        hintImage: question.hintImage || "",
      });
      setSelectedTypeId(question.typeId);
    } else if (mode === 'create') {
      form.reset({
        questionTitle: "",
        questionText: "",
        typeId: 0,
        internalTypeId: 0,
        mcA: "",
        mcB: "",
        mcC: "",
        mcD: "",
        mcCorrect: "A",
        status: "draft",
        tags: "",
        questionOrder: 1,
      });
      setSelectedTypeId(null);
    }
  }, [question, mode, form]);

  const onSubmit = (data: QuestionFormData) => {
    const submitData: InsertQuestion = {
      ...data,
      questionTitle: data.questionTitle || null,
      tags: data.tags || null,
      passageId: data.passageId || null,
      questionImage: data.questionImage || null,
      explanationImage: data.explanationImage || null,
      hintImage: data.hintImage || null,
    };
    
    saveMutation.mutate(submitData);
  };

  const handleTypeChange = (value: string) => {
    const typeId = parseInt(value);
    setSelectedTypeId(typeId);
    form.setValue("typeId", typeId);
    form.setValue("internalTypeId", 0); // Reset internal type
  };

  const handleFileUpload = (file: File, field: string) => {
    // TODO: Implement file upload to storage service
    // For now, just set a placeholder URL
    const mockUrl = `https://example.com/uploads/${file.name}`;
    form.setValue(field as keyof QuestionFormData, mockUrl);
    toast({
      title: "File uploaded",
      description: "File has been uploaded successfully",
    });
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
            {/* Basic Info */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="questionTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Title</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="e.g., اختر الإجابة الصحيحة"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="typeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Question Type</FormLabel>
                    <Select onValueChange={handleTypeChange} value={field.value?.toString()}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {questionTypes.map((type) => (
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
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                control={form.control}
                name="internalTypeId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Internal Type</FormLabel>
                    <Select 
                      onValueChange={(value) => field.onChange(parseInt(value))}
                      value={field.value?.toString()}
                      disabled={!selectedTypeId}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Internal Type" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {internalTypes.map((type) => (
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
                        <SelectItem value="under_review">Under Review</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Question Text */}
            <FormField
              control={form.control}
              name="questionText"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Question Text</FormLabel>
                  <FormControl>
                    <Textarea 
                      rows={4}
                      placeholder="Enter the question text here..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Question Image Upload */}
            <FileUpload
              label="Question Image (Optional)"
              onFileSelect={(file) => handleFileUpload(file, 'questionImage')}
              currentFile={form.watch('questionImage')}
              onFileRemove={() => form.setValue('questionImage', '')}
            />

            {/* Multiple Choice Options */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-secondary-700">
                Multiple Choice Options
              </Label>
              
              <FormField
                control={form.control}
                name="mcCorrect"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup onValueChange={field.onChange} value={field.value}>
                        {[
                          { value: 'A', label: 'Option A', color: 'bg-primary-100 text-primary-700' },
                          { value: 'B', label: 'Option B', color: 'bg-green-100 text-green-700' },
                          { value: 'C', label: 'Option C', color: 'bg-yellow-100 text-yellow-700' },
                          { value: 'D', label: 'Option D', color: 'bg-red-100 text-red-700' },
                        ].map(({ value, label, color }) => (
                          <div key={value} className="flex items-center space-x-3">
                            <div className="flex-shrink-0">
                              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${color}`}>
                                <span className="text-sm font-medium">{value}</span>
                              </div>
                            </div>
                            <FormField
                              control={form.control}
                              name={`mc${value}` as keyof QuestionFormData}
                              render={({ field: optionField }) => (
                                <FormItem className="flex-1">
                                  <FormControl>
                                    <Input 
                                      placeholder={label}
                                      {...optionField}
                                    />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                            <RadioGroupItem value={value} id={value} />
                          </div>
                        ))}
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Additional Content */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FileUpload
                label="Explanation Image (Optional)"
                description="Upload explanation"
                onFileSelect={(file) => handleFileUpload(file, 'explanationImage')}
                currentFile={form.watch('explanationImage')}
                onFileRemove={() => form.setValue('explanationImage', '')}
              />

              <FileUpload
                label="Hint Image (Optional)"
                description="Upload hint"
                onFileSelect={(file) => handleFileUpload(file, 'hintImage')}
                currentFile={form.watch('hintImage')}
                onFileRemove={() => form.setValue('hintImage', '')}
              />
            </div>

            {/* Tags */}
            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Enter tags separated by commas"
                      {...field}
                    />
                  </FormControl>
                  <p className="text-xs text-secondary-500">
                    e.g., algebra, easy, high-school
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
