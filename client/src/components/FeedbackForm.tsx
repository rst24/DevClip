import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star } from "lucide-react";
import { useState } from "react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

interface FeedbackFormProps {
  onSubmit: (rating: number, message: string) => Promise<void>;
}

export function FeedbackForm({ onSubmit }: FeedbackFormProps) {
  const [rating, setRating] = useState(0);
  const [hoverRating, setHoverRating] = useState(0);
  const [message, setMessage] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (rating === 0) {
      toast({
        title: "Please select a rating",
        description: "Tell us how you feel about DevClip",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(rating, message);
      toast({
        title: "Thank you!",
        description: "Your feedback helps us improve DevClip",
      });
      setRating(0);
      setMessage("");
    } catch (error) {
      toast({
        title: "Failed to submit",
        description: error instanceof Error ? error.message : "Please try again",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Card className="p-6">
      <h3 className="font-semibold mb-4">Share Your Feedback</h3>
      
      <div className="space-y-4">
        <div>
          <label className="text-sm font-medium mb-2 block">
            How would you rate DevClip?
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((value) => (
              <button
                key={value}
                onClick={() => setRating(value)}
                onMouseEnter={() => setHoverRating(value)}
                onMouseLeave={() => setHoverRating(0)}
                className="transition-transform hover:scale-110"
                data-testid={`button-rating-${value}`}
              >
                <Star
                  className={cn(
                    "h-8 w-8 transition-colors",
                    (hoverRating >= value || rating >= value)
                      ? "fill-amber-400 text-amber-400"
                      : "text-muted-foreground"
                  )}
                />
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="text-sm font-medium mb-2 block">
            Additional comments (optional)
          </label>
          <Textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what you think..."
            className="resize-none"
            rows={4}
            data-testid="textarea-feedback"
          />
        </div>

        <Button
          onClick={handleSubmit}
          disabled={submitting || rating === 0}
          className="w-full"
          data-testid="button-submit-feedback"
        >
          {submitting ? "Submitting..." : "Submit Feedback"}
        </Button>
      </div>
    </Card>
  );
}
