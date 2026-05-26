"use client";

import { useState, useEffect, useRef } from "react";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "What is LMS OS?",
    answer: "LMS OS is an all-in-one learning management system designed for schools, coaching centers, and training institutes. It provides comprehensive tools for course management, student engagement, real-time collaboration, and advanced analytics.",
  },
  {
    question: "Can I try LMS OS for free?",
    answer: "Yes! We offer a 30-day free trial with full access to all features. No credit card required. You can explore all functionalities and see if it's the right fit for your institution.",
  },
  {
    question: "How do I migrate from my current LMS?",
    answer: "Our team provides dedicated migration support to help you transfer your courses, students, and data seamlessly. We offer guided migration tools and personalized assistance to ensure a smooth transition.",
  },
  {
    question: "Is my data secure?",
    answer: "Security is our top priority. We use bank-grade encryption, maintain SOC 2 compliance, and implement granular access controls. Your data is encrypted both in transit and at rest.",
  },
  {
    question: "What kind of support do you offer?",
    answer: "We offer 24/7 email support for all plans, and priority/phone support for Growth and Enterprise tiers. Our support team is always ready to help with technical issues, feature questions, or best practices.",
  },
  {
    question: "Can I customize the platform for my institution?",
    answer: "Absolutely! Enterprise customers get access to custom branding, white-label options, API access, and the ability to build custom integrations tailored to your specific needs.",
  },
];

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.1 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <section id="faq" className="relative overflow-hidden py-24 lg:py-32" ref={ref}>
      <div className="max-w-4xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Questions
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            Frequently asked.
            <br />
            <span className="text-muted-foreground">Quickly answered.</span>
          </h2>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className={`border border-foreground/10 rounded-lg overflow-hidden transition-all duration-500 ${
                isVisible
                  ? "opacity-100 translate-y-0"
                  : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: isVisible ? `${index * 50}ms` : "0ms",
              }}
            >
              <button
                onClick={() =>
                  setOpenIndex(openIndex === index ? null : index)
                }
                className="w-full flex items-center justify-between p-6 hover:bg-foreground/5 transition-colors duration-300"
              >
                <span className="text-lg font-semibold text-left">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`w-5 h-5 text-muted-foreground transition-transform duration-300 flex-shrink-0 ml-4 ${
                    openIndex === index ? "rotate-180" : ""
                  }`}
                />
              </button>

              {openIndex === index && (
                <div className="px-6 pb-6 border-t border-foreground/10 pt-4">
                  <p className="text-muted-foreground leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 p-8 lg:p-12 bg-foreground/5 rounded-2xl border border-foreground/10 text-center">
          <h3 className="text-2xl font-display mb-3">Still have questions?</h3>
          <p className="text-muted-foreground mb-6">
            Can&apos;t find the answer you&apos;re looking for? Contact our support team.
          </p>
          <a
            href="mailto:support@lmsos.com"
            className="inline-flex items-center gap-2 text-foreground hover:text-muted-foreground transition-colors"
          >
            Get in touch →
          </a>
        </div>
      </div>
    </section>
  );
}
