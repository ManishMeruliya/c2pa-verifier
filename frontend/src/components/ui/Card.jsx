import { cn } from "../../utils/cn";

const Card = ({ children, className = "", variant = "default", ...props }) => {
  const variants = {
    default: "bg-white rounded-2xl shadow-lg border border-gray-100",
    elevated: "bg-white rounded-2xl shadow-2xl border border-gray-100",
    outlined: "bg-white rounded-2xl border-2 border-gray-200",
    glass: "bg-white/80 backdrop-blur-sm rounded-2xl shadow-xl border border-white/20"
  };

  return (
    <div
      className={cn(variants[variant], className)}
      {...props}
    >
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = "", ...props }) => (
  <div className={cn("p-6 pb-4", className)} {...props}>
    {children}
  </div>
);

const CardContent = ({ children, className = "", ...props }) => (
  <div className={cn("p-6", className)} {...props}>
    {children}
  </div>
);

const CardFooter = ({ children, className = "", ...props }) => (
  <div className={cn("p-6 pt-4", className)} {...props}>
    {children}
  </div>
);

Card.Header = CardHeader;
Card.Content = CardContent;
Card.Footer = CardFooter;

export default Card;
