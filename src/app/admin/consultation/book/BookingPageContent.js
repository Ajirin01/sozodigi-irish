'use client'

import React, { useState, useEffect } from 'react'
import ConsultationBooking from "@/components/BookingPage"

const ConsultationBookingPageContent = () => {
  const isCertPage = false
  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-0">
      <ConsultationBooking isCertPage={isCertPage} />
    </div>
  )
}

export default ConsultationBookingPageContent
