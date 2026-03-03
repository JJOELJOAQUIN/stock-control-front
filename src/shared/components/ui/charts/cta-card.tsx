import type React from "react";
import { ArrowRight } from "lucide-react";
import { Button } from "../button";
import { Card } from "../card";
import { Link } from "react-router-dom";

interface CTACardProps {
  title: string;
  description: string;
  href?: string;
  buttonText?: string;
  icon?: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

export function CTACard({
  title,
  description,
  href,
  buttonText = "Ir ahora",
  icon,
  onClick,
  className,
}: CTACardProps) {

  const handleClick = () => {
    if (onClick) onClick();
  };

  const button = (
    <Button
      type="button"
      variant="outline"
      onClick={!href ? handleClick : undefined}
      className="group/btn w-full justify-between border-primary/20 transition-all duration-300 hover:border-primary hover:bg-button-gradient hover:text-primary-foreground sm:w-auto bg-transparent"
    >
      {buttonText}
      <ArrowRight className="ml-2 size-4 transition-transform duration-300 group-hover/btn:translate-x-1" />
    </Button>
  );

  return (
    <Card
      className={[
        "group relative overflow-hidden border-2 border-border from-card via-card to-accent/5 p-6 transition-all duration-300 hover:border-primary/50 hover:shadow-lg",
        className ?? "",
      ].join(" ")}
      onClick={!href ? handleClick : undefined}
    >
      {/* Decorative element */}
      <div className="absolute -right-8 -top-8 size-24 rounded-full bg-primary/5 transition-transform duration-300 group-hover:scale-150" />

      {/* Icon */}
      {icon && (
        <div className="flex size-12 items-center justify-center rounded-lg bg-primary/10 text-primary transition-colors duration-300 group-hover:bg-primary/20">
          {icon}
        </div>
      )}

      <div className="flex flex-col gap-2 mt-4">
        <h3 className="text-xl font-semibold text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-4">
        {href ? (
          <Link to={href} onClick={handleClick}>
            {button}
          </Link>
        ) : (
          button
        )}
      </div>
    </Card>
  );
}