"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Play } from "lucide-react";

export function DemoSection() {
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const [isVideoOpen, setIsVideoOpen] = useState(false);

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
    <section id="demo" className="relative overflow-hidden py-24 lg:py-32" ref={ref}>
      <div className="max-w-6xl mx-auto px-6 lg:px-12">
        {/* Header */}
        <div className="mb-16 lg:mb-24 max-w-3xl">
          <span className="inline-flex items-center gap-3 text-sm font-mono text-muted-foreground mb-6">
            <span className="w-8 h-px bg-foreground/30" />
            Live Demo
          </span>
          <h2
            className={`text-4xl lg:text-6xl font-display tracking-tight transition-all duration-700 ${
              isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
            }`}
          >
            See it in action.
            <br />
            <span className="text-muted-foreground">Experience the power.</span>
          </h2>
        </div>

        {/* Demo Container */}
        <div
          className={`relative rounded-2xl overflow-hidden border border-foreground/10 bg-foreground/5 transition-all duration-700 ${
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          }`}
        >
          {/* Demo Image/Placeholder */}
          <div className="relative w-full aspect-video bg-gradient-to-br from-foreground/10 to-foreground/5 flex items-center justify-center group cursor-pointer overflow-hidden">
            {/* Animated grid background */}
            <div className="absolute inset-0 opacity-30">
              <div className="absolute inset-0 bg-[linear-gradient(90deg,transparent_24%,rgba(68,68,68,.05)_25%,rgba(68,68,68,.05)_26%,transparent_27%,transparent_74%,rgba(68,68,68,.05)_75%,rgba(68,68,68,.05)_76%,transparent_77%,transparent),linear-gradient(0deg,transparent_24%,rgba(68,68,68,.05)_25%,rgba(68,68,68,.05)_26%,transparent_27%,transparent_74%,rgba(68,68,68,.05)_75%,rgba(68,68,68,.05)_76%,transparent_77%,transparent)] bg-[length:50px_50px]" />
            </div>

            {/* Dashboard mockup content */}
            <div className="relative z-10 text-center">
              <div className="mb-6 inline-flex items-center justify-center w-16 h-16 rounded-full bg-foreground/10 group-hover:bg-foreground/20 transition-colors">
                <Play className="w-8 h-8 ml-1" fill="currentColor" />
              </div>
              <h3 className="text-2xl font-display mb-2">Interactive Platform Tour</h3>
              <p className="text-muted-foreground mb-6">
                Explore all features and functionality
              </p>
              <Button
                onClick={() => setIsVideoOpen(!isVideoOpen)}
                className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-8 h-12"
              >
                Watch Demo Video
              </Button>
            </div>

            {/* Hover effect overlay */}
            <div className="absolute inset-0 bg-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>
        </div>

        {/* Features of the demo */}
        <div className="grid md:grid-cols-3 gap-8 mt-16">
          {[
            {
              title: "Student Dashboard",
              description:
                "Personalized learning experience with progress tracking and course access",
            },
            {
              title: "Instructor Tools",
              description:
                "Create courses, manage assignments, grade submissions, and track analytics",
            },
            {
              title: "Admin Control",
              description:
                "Institutional settings, user management, reporting, and compliance tools",
            },
          ].map((feature, index) => (
            <div
              key={index}
              className={`p-6 rounded-lg border border-foreground/10 bg-foreground/5 transition-all duration-700 ${
                isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
              }`}
              style={{
                transitionDelay: isVisible ? `${(index + 1) * 100}ms` : "0ms",
              }}
            >
              <h3 className="font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">
                {feature.description}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-muted-foreground mb-6">
            Ready to get started with LMS OS?
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button className="bg-foreground hover:bg-foreground/90 text-background rounded-full px-8 h-12">
              Start Free Trial
            </Button>
            <Button
              variant="outline"
              className="rounded-full px-8 h-12 border-foreground/20 hover:bg-foreground/5"
            >
              Schedule Demo Call
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
