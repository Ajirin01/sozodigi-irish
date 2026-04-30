"use client";
import React from "react";

const MedicalCertificate = ({
  patientName = "Emma Davis",
  issueDate = "2024-05-10",
  diagnosis = "bronchitis symptoms",
  comment = "",
  doctor = "Dr. Robert Michaels",
  patientID = "6677889",
  certID = "CH–2024–34567",
  qrCodeUrl = "/images/qrcode.png",
  doctorSignature = "/images/signature.png"
}) => {
  const apiUrl = process.env.NEXT_PUBLIC_NODE_BASE_URL;

  return (
    <div className="w-full px-2 sm:px-4 md:px-6 py-10 print:p-0 flex justify-center print:bg-white">
      <div className="bg-white w-full max-w-[794px] border shadow print:shadow-none print:border-none p-6 sm:p-10 text-gray-900 relative">
        {/* Watermark */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03]">
           <img src="/images/logo/icon.png" className="w-[80%] h-[80%] object-contain" alt="Watermark" />
        </div>

        <div className="border-[6px] border-blue-100 p-4 sm:p-6 md:p-10 text-center">
          {/* Header */}
          <div className="mb-10">
            <img
              src="/images/logo/logo.png"
              alt="Sozodigicare"
              className="h-12 mx-auto mb-2"
            />
            <h2 className="text-base sm:text-lg font-extrabold uppercase tracking-widest text-blue-900">Sozodigicare</h2>
            <p className="text-xs text-gray-500 uppercase tracking-tighter">Verified Medical Documentation</p>
            
            <h1
              className="text-xl sm:text-2xl md:text-[28px] lg:text-[34px] xl:text-[40px] font-bold text-[#335b75] uppercase tracking-wide mt-12 mb-12"
              style={{ fontFamily: "'Playfair Display', serif" }}
            >
              Medical Certificate
            </h1>
          </div>

          {/* Body */}
          <div className="leading-relaxed mb-10 text-left px-4 sm:px-10 space-y-6">
            <p className="text-lg">
              This is to certify that <strong>{patientName}</strong> was medically examined on <strong>{new Date(issueDate).toLocaleDateString()}</strong>.
            </p>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm font-bold text-blue-600 mb-2 uppercase">Diagnosis</p>
                <p className="text-gray-800 font-medium italic">"{diagnosis}"</p>
            </div>

            <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100">
                <p className="text-sm font-bold text-blue-600 mb-2 uppercase">Medical Advice / Recommendations</p>
                <p className="text-gray-800 leading-relaxed whitespace-pre-wrap">{comment || "The patient is advised to take medical rest as per the diagnosis above."}</p>
            </div>
          </div>

          {/* Footer */}
          <div className="mt-12 border-t pt-10">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-10">
              {/* Doctor Info & Signature */}
              <div className="flex flex-col items-center">
                {doctorSignature ? (
                    <img
                      src={doctorSignature.startsWith('http') ? doctorSignature : (apiUrl + doctorSignature)}
                      alt="Doctor's Signature"
                      className="h-20 w-auto mb-2 mix-blend-multiply"
                    />
                ) : (
                    <div className="h-20 w-32 border-b-2 border-gray-300 mb-2 flex items-center justify-center text-gray-400 italic text-xs">
                        No signature provided
                    </div>
                )}
                <div className="text-center">
                  <p className="font-extrabold text-blue-900">{doctor}</p>
                  <p className="text-xs uppercase font-bold text-gray-500 tracking-widest">Medical Practitioner</p>
                </div>
              </div>

              {/* QR Code */}
              <div className="flex flex-col items-center">
                <div className="p-2 bg-white border border-gray-200 rounded-xl shadow-sm">
                    <img
                      src={qrCodeUrl.startsWith('http') ? qrCodeUrl : (apiUrl + qrCodeUrl)}
                      alt="Verification QR"
                      className="w-24 h-24"
                    />
                </div>
                <p className="mt-2 text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Scan to Verify Certificate</p>
              </div>
            </div>

            {/* Identifiers */}
            <div className="mt-12 grid grid-cols-2 gap-4 pt-6 border-t border-dashed text-[10px] uppercase font-bold text-gray-400 tracking-widest">
              <div className="text-left">
                Patient Ref: <span className="text-gray-600">{patientID}</span>
              </div>
              <div className="text-right">
                Cert ID: <span className="text-blue-600">{certID}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MedicalCertificate;
