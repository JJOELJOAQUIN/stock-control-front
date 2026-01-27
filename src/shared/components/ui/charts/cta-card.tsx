import type React from "react";

import { ArrowRight, Sparkles } from "lucide-react";

import { Button } from "../button";
import { Card } from "../card";
import { Link } from "react-router-dom";

interface CTACardProps {
  title: string;
  description: string;
  href: string;
  buttonText?: string;
  icon?: React.ReactNode;
}

export function CTACard({
  title,
  description,
  href,
  buttonText = "Ir ahora",
  icon,
}: CTACardProps) {
  return (
    <Card className="group relative overflow-hidden border-2 border-border  from-card via-card to-accent/5 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg">
      {/* Decorative element - top right corner */}
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />

      {/* Sparkle decoration */}
      <div className="absolute right-4 top-4 text-primary/20 transition-all duration-300 group-hover:text-primary/40 group-hover:rotate-12">
        {icon}
      </div>

      <div className="relative flex flex-col gap-4">
        {/* Icon */}
        {icon && (
          <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
            {icon}
          </div>
        )}

        {/* Content */}
        <div className="flex flex-col gap-2">
          <h3 className="text-xl font-semibold text-foreground">{title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            {description}
          </p>
        </div>

        {/* CTA Button */}
        <Link to={href} className="mt-2">
          <Button
            variant="outline"
            className="group/btn w-full justify-between border-primary/20 transition-all duration-300 hover:border-primary  hover:bg-button-gradient hover:text-primary-foreground sm:w-auto bg-transparent"
          >
            {buttonText}
            <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
