import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const stats = [
  { label: "Specialists", count: 50 },
  { label: "Departments", count: 15 },
  { label: "Patients Served", count: 3000 },
  { label: "Consultations Completed", count: 8000 },
];

const Counter = ({ end, duration }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let start = 0;
    const increment = Math.ceil(end / (duration * 60)); // 60fps
    const interval = setInterval(() => {
      start += increment;
      if (start >= end) {
        setCount(end);
        clearInterval(interval);
      } else {
        setCount(start);
      }
    }, 1000 / 60);

    return () => clearInterval(interval);
  }, [end, duration]);

  return <span>{count.toLocaleString()}</span>;
};

const WhyChooseSozo = () => {
  return (
    <section className="py-20 px-4 bg-white">
      <div className="max-w-6xl mx-auto text-center">
        <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-12">
          Why Choose SozoDigiCare
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {stats.map((item, index) => (
            <motion.div
              key={index}
              className="bg-gray-50 rounded-2xl p-6 shadow-md"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              <motion.h3
                className="text-4xl font-extrabold text-primary-600"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ duration: 0.6 }}
              >
                <Counter end={item.count} duration={2} />+
              </motion.h3>
              <p className="mt-2 text-gray-600 text-sm">{item.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default WhyChooseSozo;
