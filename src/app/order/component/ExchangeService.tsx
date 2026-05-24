"use client"
import { Button } from '@/components/ui/button'
import { ArrowLeftRight } from 'lucide-react'
import ExchangeModal from '../ordermodal/ExchangeModal'
import { useState } from 'react';

const ExchangeService = () => {
    const [isExchangeeDialogOpen, setIsExchangeDialogOpen] = useState(false);
  return (
    <div className="flex flex-col justify-center items-center h-screen bg-gray-50 dark:bg-gray-900 p-4">
      <div className="flex flex-col items-center space-y-6 max-w-md w-full">
        <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full">
          <ArrowLeftRight className="w-12 h-12 text-blue-600 dark:text-blue-400" />
        </div>
        
        <div className="text-center space-y-3">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 dark:text-gray-100">
            Edit Service
          </h1>
          <p className="text-base text-gray-600 dark:text-gray-300 max-w-sm">
            Request an exchange for your purchased service. Switch to a different service plan that better fits your needs.
          </p>
        </div>
        
        <Button className="px-8 py-2.5 text-base font-medium rounded-lg shadow-sm hover:shadow-md transition-all bg-blue-600 hover:bg-blue-700 text-white"
        onClick={()=>setIsExchangeDialogOpen(true)}
        >
          Start Edit
        </Button>
      </div>
      <ExchangeModal
        open={isExchangeeDialogOpen}
        onOpenChange={setIsExchangeDialogOpen}
      />
    </div>
  )
}

export default ExchangeService