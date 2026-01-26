/*
 * File: src/components/ExpertDocumentCard.js
 * SR-DEV: Reusable Card for Expert Documents/Credentials
 *
 * FEATURES:
 * - Differentiates between 'image' and 'pdf' types.
 * - Shows a clear 'View' action.
 */

"use client";

import { cn } from "@/lib/utils";
import { FileText, ImageIcon, Download, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function ExpertDocumentCard({ document, onDocumentClick }) {
  const isImage = document.type === "image";
  const Icon = isImage ? ImageIcon : FileText;

  return (
    <div 
      className="group flex flex-col justify-between h-full p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm transition-all duration-200 hover:shadow-md hover:border-zinc-300 dark:hover:border-zinc-700 cursor-pointer"
      onClick={() => onDocumentClick(document)}
    >
      <div className="flex items-start gap-4 mb-4">
        <div className={cn(
          "h-10 w-10 flex items-center justify-center rounded-lg shrink-0",
          isImage ? "bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
        )}>
          <Icon className="w-5 h-5" />
        </div>
        
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-zinc-900 dark:text-white truncate" title={document.title}>
            {document.title}
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 uppercase tracking-wider">
            {isImage ? "Certificate" : "License/Report"}
          </p>
        </div>
      </div>
      
      {/* Footer/Action */}
      <div className="flex justify-between items-center pt-2 border-t border-zinc-100 dark:border-zinc-800">
          <div className="flex items-center text-xs text-green-600 dark:text-green-400 font-medium">
             <CheckCircle2 className="w-3 h-3 mr-1" /> Verified
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            className="h-7 text-xs px-3 gap-1.5 border-zinc-300 dark:border-zinc-700"
          >
             View Document
          </Button>
      </div>

    </div>
  );
}