"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getBookingDetailsApi, createRefundRequestApi } from "@/lib/bookingsApi";
import { apiClient } from "@/lib/apiClient";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  ArrowLeft,
  Calendar,
  ThumbsDown,
  AlertTriangle,
  Pause,
  MapPinOff,
  Store,
  UserMinus,
  UserX,
  ClipboardList,
  Tag,
  MoreHorizontal,
  Upload,
  X,
  Check,
  Loader2,
  FileText,
  Clock,
  Sparkles
} from "lucide-react";

const REASONS = [
  {
    id: "Duplicate Booking",
    num: 1,
    title: "Duplicate Booking",
    desc: "I booked the same service or appointment multiple times by mistake.",
    icon: Calendar,
  },
  {
    id: "Poor Service Quality",
    num: 2,
    title: "Poor Service Quality",
    desc: "The service quality was not satisfactory or didn't meet expectations.",
    icon: ThumbsDown,
  },
  {
    id: "Paid but Didn't Receive Service",
    num: 3,
    title: "Paid but Didn't Receive Service",
    desc: "I made the payment but didn't receive the service.",
    icon: Clock,
  },
  {
    id: "Service Stopped in Between",
    num: 4,
    title: "Service Stopped in Between",
    desc: "The service was interrupted or not completed.",
    icon: Pause,
  },
  {
    id: "Any Major Dispute",
    num: 5,
    title: "Any Major Dispute",
    desc: "I have a major issue or disagreement with the business or staff.",
    icon: AlertTriangle,
  },
  {
    id: "Did Not Reach to Store",
    num: 6,
    title: "Did Not Reach to Store",
    desc: "I was unable to reach the store due to some issue.",
    icon: MapPinOff,
  },
  {
    id: "Store Was Closed",
    num: 7,
    title: "Store Was Closed",
    desc: "The store was closed when I arrived for my appointment.",
    icon: Store,
  },
  {
    id: "Therapist No-Show",
    num: 8,
    title: "Therapist No-Show",
    desc: "The therapist did not show up for my appointment.",
    icon: UserMinus,
  },
  {
    id: "Wrong Therapist Assigned",
    num: 9,
    title: "Wrong Therapist Assigned",
    desc: "A different therapist was assigned without my consent.",
    icon: UserX,
  },
  {
    id: "Wrong Service Booked",
    num: 10,
    title: "Wrong Service Booked",
    desc: "I booked the wrong service by mistake.",
    icon: ClipboardList,
  },
  {
    id: "Pricing Issue",
    num: 11,
    title: "Pricing Issue",
    desc: "I was charged incorrectly or saw different pricing.",
    icon: Tag,
  },
  {
    id: "Other (Please Specify)",
    num: 12,
    title: "Other (Please Specify)",
    desc: "My reason is not listed above.",
    icon: MoreHorizontal,
  },
];

interface RefundPageProps {
  params: Promise<{ id: string }>;
}

export default function RequestRefundPage({ params }: RefundPageProps) {
  const { id } = use(params);
  const router = useRouter();
  const { isAuthenticated, isLoading: authLoading } = useAuth();
  
  const [bookingData, setBookingData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  
  const [selectedReason, setSelectedReason] = useState<string>("Duplicate Booking");
  const [details, setDetails] = useState<string>("");
  const [uploadedFiles, setUploadedFiles] = useState<Array<{ name: string; url: string; size: string }>>([]);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      router.push("/login");
    }
  }, [isAuthenticated, authLoading, router]);

  useEffect(() => {
    async function fetchDetails() {
      if (!isAuthenticated) return;
      try {
        const data = await getBookingDetailsApi(id);
        if (data) {
          setBookingData(data);
        }
      } catch (err: any) {
        console.error("Error fetching booking details:", err);
        toast.error("Failed to load booking details.");
      } finally {
        setLoading(false);
      }
    }
    fetchDetails();
  }, [id, isAuthenticated]);

  const handleFileUpload = async (filesList: FileList | null) => {
    if (!filesList || filesList.length === 0) return;
    setUploading(true);
    const API_BASE = process.env.NEXT_PUBLIC_API_URL;
    
    for (let i = 0; i < filesList.length; i++) {
      const file = filesList[i];
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} exceeds the 5MB file limit.`);
        continue;
      }
      
      const formData = new FormData();
      formData.append("file", file);
      
      try {
        const res = await apiClient<any>(`${API_BASE}/chat/upload`, {
          method: "POST",
          body: formData,
        });
        
        if (res && res.fileUrl) {
          const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + " MB";
          setUploadedFiles(prev => [...prev, { name: file.name, url: res.fileUrl, size: fileSizeStr }]);
        }
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error(`Failed to upload ${file.name}`);
      }
    }
    setUploading(false);
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files);
    }
  };

  const handleSubmit = async () => {
    if (!selectedReason) {
      toast.error("Please select a reason for the refund.");
      return;
    }
    if (selectedReason === "Other (Please Specify)" && !details.trim()) {
      toast.error("Please specify details for your refund reason.");
      return;
    }

    setSubmitting(true);
    try {
      await createRefundRequestApi({
        bookingId: id,
        amount: bookingData.booking.amount,
        reason: selectedReason,
        refundType: "full",
        paymentMethod: "original",
        metadata: {
          customerNotes: details || null,
          attachments: uploadedFiles,
          submittedAt: new Date().toISOString(),
        },
      });

      toast.success("Refund request submitted successfully!");
      router.push("/appointments");
    } catch (err: any) {
      console.error("Refund request error:", err);
      toast.error(err.message || "Failed to submit refund request.");
    } finally {
      setSubmitting(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
      </div>
    );
  }

  if (!bookingData || !bookingData.booking) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-4 text-center">
        <AlertTriangle className="h-12 w-12 text-rose-500" />
        <h2 className="text-xl font-bold">Booking Not Found</h2>
        <p className="text-zinc-500">We couldn't retrieve the details for this booking.</p>
        <Link href="/appointments">
          <Button>Back to Appointments</Button>
        </Link>
      </div>
    );
  }

  const { booking, expert, organization } = bookingData;
  const priceDisplay = booking.amount ? (booking.amount.startsWith("$") ? booking.amount : `$${booking.amount}`) : "$0.00";
  const dateFormatted = new Date(booking.scheduledDate).toLocaleDateString("en-US", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC"
  });
  const timeFormatted = new Date(booking.scheduledDate).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true
  });

  return (
    <div className="min-h-screen bg-zinc-50/50 dark:bg-zinc-950/20 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto space-y-6">
        
        {/* Back Link */}
        <Link href="/appointments" className="inline-flex items-center gap-2 text-sm text-zinc-500 hover:text-zinc-800 transition-colors">
          <ArrowLeft className="w-4 h-4" />
          Back
        </Link>

        {/* Top Split Layout: Header Title vs. Details Card */}
        <div className="flex flex-col lg:flex-row justify-between items-start gap-6">
          <div className="space-y-2 max-w-xl">
            <h1 className="text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">Request a Refund</h1>
            <p className="text-zinc-500 dark:text-zinc-400">
              We're sorry to hear you had an issue. Please tell us the reason for your refund request.
            </p>
          </div>

          {/* Booking Summary Card */}
          <div className="w-full lg:w-96 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-4 shadow-sm flex items-start gap-3 justify-between">
            <div className="flex items-start gap-3">
              <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center text-zinc-400 overflow-hidden flex-shrink-0">
                <Sparkles className="w-6 h-6 text-zinc-400" />
              </div>
              <div>
                <h4 className="font-bold text-zinc-900 dark:text-white text-sm line-clamp-1">{booking.service}</h4>
                <p className="text-zinc-500 text-xs">{organization?.name || expert?.name || "Bliss Wellness Spa"}</p>
                <p className="text-zinc-400 text-[11px] mt-1">{dateFormatted} • {timeFormatted}</p>
              </div>
            </div>
            <div className="text-right flex-shrink-0">
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-green-50 text-green-700 dark:bg-green-950/30 dark:text-green-400 uppercase tracking-wider">
                Paid
              </span>
              <p className="font-extrabold text-zinc-900 dark:text-white mt-1 text-sm">{priceDisplay}</p>
            </div>
          </div>
        </div>

        {/* Reason Selection Grid */}
        <div className="space-y-4">
          <h3 className="text-md font-bold text-zinc-900 dark:text-white">Select a reason</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {REASONS.map((r) => {
              const IconComp = r.icon;
              const isSelected = selectedReason === r.id;
              
              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReason(r.id)}
                  className={`relative p-5 text-left border rounded-xl bg-white dark:bg-zinc-900 transition-all duration-200 group flex flex-col justify-between min-h-[140px] focus:outline-none focus:ring-2 focus:ring-violet-500/20 ${
                    isSelected
                      ? "border-violet-600 ring-2 ring-violet-600/10 shadow-sm"
                      : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 hover:shadow-sm"
                  }`}
                >
                  {/* Select indicator */}
                  <div className={`absolute top-3 right-3 w-5 h-5 rounded-full flex items-center justify-center border transition-all ${
                    isSelected
                      ? "bg-violet-600 border-violet-600 text-white"
                      : "border-zinc-300 dark:border-zinc-700 text-transparent"
                  }`}>
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>

                  {/* Header Row with Icon and Number */}
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isSelected
                        ? "bg-violet-50 dark:bg-violet-950/20 text-violet-600"
                        : "bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 group-hover:bg-zinc-200"
                    }`}>
                      <IconComp className="w-5 h-5" />
                    </div>
                    <span className="text-xs font-bold text-zinc-400">#{r.num}</span>
                  </div>

                  {/* Text Description */}
                  <div className="mt-4 space-y-1">
                    <h4 className="font-bold text-zinc-900 dark:text-white text-sm leading-tight">{r.title}</h4>
                    <p className="text-zinc-500 dark:text-zinc-400 text-xs leading-normal line-clamp-2">{r.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Input Details */}
        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <div className="space-y-2">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-white">
              Add more details {selectedReason === "Other (Please Specify)" ? "" : "(Optional)"}
            </h3>
            <div className="relative">
              <Textarea
                placeholder="Please provide any additional details that can help us understand your issue better..."
                value={details}
                onChange={(e) => setDetails(e.target.value.slice(0, 500))}
                className="min-h-[120px] bg-zinc-50/50 dark:bg-zinc-950/10 border-zinc-200 dark:border-zinc-800 focus-visible:ring-violet-500/20 resize-none text-sm text-zinc-800 dark:text-zinc-100"
              />
              <div className="absolute bottom-3 right-3 text-[11px] text-zinc-400 font-medium">
                {details.length}/500
              </div>
            </div>
          </div>
        </div>

        {/* Dropzone Upload Attachments */}
        <div className="space-y-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white">Upload attachment (Optional)</h3>
          
          <div
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-all ${
              dragActive
                ? "border-violet-500 bg-violet-50/20"
                : "border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/30"
            }`}
          >
            <input
              id="file-upload"
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif,image/webp,application/pdf"
              onChange={(e) => handleFileUpload(e.target.files)}
              className="hidden"
            />
            
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center gap-2">
              <div className="p-3 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400">
                <Upload className="w-6 h-6" />
              </div>
              <p className="text-sm font-bold text-zinc-700 dark:text-zinc-300 mt-1">
                Drag & drop files here or <span className="text-violet-600 hover:text-violet-700 hover:underline">click to upload</span>
              </p>
              <p className="text-xs text-zinc-400 mt-0.5">
                Upload screenshots or photos (JPG, PNG, PDF up to 5MB)
              </p>
            </label>
          </div>

          {/* Uploaded files list */}
          {uploadedFiles.length > 0 && (
            <div className="mt-4 space-y-2 border-t dark:border-zinc-800 pt-4">
              <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Uploaded attachments</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 border border-zinc-200 dark:border-zinc-800 rounded-xl bg-zinc-50/30">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="p-2 bg-violet-50 dark:bg-violet-950/20 text-violet-600 rounded">
                        <FileText className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-zinc-900 dark:text-white truncate">{file.name}</p>
                        <p className="text-[10px] text-zinc-400 mt-0.5">{file.size}</p>
                      </div>
                    </div>
                    <button
                      onClick={() => removeFile(idx)}
                      className="p-1 rounded-full hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {uploading && (
            <div className="flex items-center gap-2 text-xs font-medium text-zinc-500 justify-center py-2 animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin text-violet-600" />
              Uploading attachments...
            </div>
          )}
        </div>

        {/* Footer split: Notice vs Submit Action */}
        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 shadow-sm">
          <p className="text-xs text-zinc-400 font-medium text-center sm:text-left">
            We will review your request and get back to you within 2-3 business days.
          </p>

          <Button
            onClick={handleSubmit}
            disabled={submitting || uploading}
            className="w-full sm:w-auto px-8 bg-violet-600 hover:bg-violet-700 text-white font-bold h-11 text-sm shadow-md shadow-violet-200 dark:shadow-none hover:shadow-lg transition-all rounded-xl gap-2 disabled:opacity-50"
          >
            {submitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
              </>
            ) : (
              "Submit Refund Request"
            )}
          </Button>
        </div>

      </div>
    </div>
  );
}
