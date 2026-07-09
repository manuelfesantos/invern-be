import { forwardRef, type InputHTMLAttributes } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { cn } from "../../lib/cn";

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  error?: string;
}

// RHF-friendly: spread `register("field")` onto it; pass the field error message.
export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  ({ label, error, id, name, className, ...props }, ref) => {
    const fieldId = id ?? name;
    return (
      <div className={cn("space-y-1", className)}>
        <Label htmlFor={fieldId}>{label}</Label>
        <Input
          id={fieldId}
          name={name}
          ref={ref}
          aria-invalid={error ? true : undefined}
          {...props}
        />
        {error && <p className="text-xs text-red-600">{error}</p>}
      </div>
    );
  },
);
TextField.displayName = "TextField";
