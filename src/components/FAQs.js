import { useRef, useState } from "react";
import { FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { faqItems } from "@/data/faqData";
import { motion, AnimatePresence } from 'framer-motion';

export default function FaqSection() {
  const [activeIndex, setActiveIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const refs = useRef([]);

  const toggleAccordion = (index) => {
    const alreadyOpen = activeIndex === index;
    setActiveIndex(alreadyOpen ? null : index);

    // scroll into view after a delay
    setTimeout(() => {
      if (!alreadyOpen && refs.current[index]) {
        refs.current[index].scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }, 100);
  };

  const displayedFaqs = showAll ? faqItems : faqItems.slice(0, 5);

  return (
    <section className="relative faq-section bg-white rounded-3xl mx-4 mt-8 mb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h2 className="text-3xl md:text-4xl font-bold mb-10 text-center text-primary-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          {displayedFaqs.map((faq, index) => (
            <div
              key={index}
              ref={(el) => (refs.current[index] = el)}
              className="bg-gray-50 rounded-2xl overflow-hidden shadow-md transition hover:shadow-lg"
            >
              <button
                onClick={() => toggleAccordion(index)}
                className="w-full p-6 flex justify-between items-center text-left focus:outline-none"
              >
                <h3 className="text-md sm:text-lg font-semibold text-primary-9">{faq.question}</h3>
                {activeIndex === index ? (
                  <FaChevronUp className="text-secondary-6 transition-transform" />
                ) : (
                  <FaChevronDown className="text-secondary-6 transition-transform" />
                )}
              </button>

              <AnimatePresence>
                {activeIndex === index && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="px-6 pb-6 text-gray-600 text-sm sm:text-base leading-relaxed">
                      {faq.answer}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          ))}
        </div>

        {/* Show More / Less Button */}
        {faqItems.length > 5 && (
          <div className="mt-10 text-center">
            <button
              onClick={() => setShowAll((prev) => !prev)}
              className="text-blue-900 text-sm sm:text-base font-medium hover:underline focus:outline-none"
            >
              {showAll ? "Show Less FAQs" : "Show All FAQs"}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
