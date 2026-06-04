import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getSocket } from "@/lib/socket";
import { useSession } from "next-auth/react";

const BookAppointmentBTN = ({ category }) => {
  const router = useRouter();
  const { data: session } = useSession();
  const [onlineSpecialist, setOnlineSpecialist] = useState(null);

  useEffect(() => {
    const socket = getSocket();

    // Request the latest list of online specialists immediately
    socket.emit("get-online-specialists");

    const handleUpdate = (data) => {
      console.log("Online specialists update:", data);
      
      // Look for any online specialist that matches our target category (or just any specialist if category isn't defined)
      const matchingSpecialist = data.find(specialist => {
        // If the button specifies a category (like "General Practitioner"), only match those
        if (category) {
          return specialist.category === category;
        }
        return true; // Match anyone if no category specified
      });

      setOnlineSpecialist(matchingSpecialist || null);
    };

    socket.on("update-specialists", handleUpdate);

    return () => {
      socket.off("update-specialists", handleUpdate);
    };
  }, [category]);

  const handleClick = () => {
    const targetUrl = onlineSpecialist 
      ? "/admin/consultation/book?consultationMode=now"
      : "/admin/consultation/book?consultationMode=appointment";

    if (!session) {
      router.push(`/login?callbackUrl=${encodeURIComponent(targetUrl)}`);
    } else {
      router.push(targetUrl);
    }
  };

  return (
    <>
      {/* CTA Button */}
      <div className="mt-12 z-9999">
        <button
          onClick={handleClick}
          className="bg-blue-900 text-white font-semibold px-6 py-3 rounded-lg shadow-md hover:bg-blue-800 transition inline-flex items-center whitespace-nowrap"
        >
          {onlineSpecialist ? "Consult Now" : "Book Appointment"}
        </button>
      </div>
    </>
  );
};

export default BookAppointmentBTN;
