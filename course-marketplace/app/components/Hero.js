import { Button } from "../../components/ui/button";
import Link from "next/link";

export default function Hero() {
  return (
    <div className="bg-gradient-to-r from-primary/10 to-secondary/10 py-24 px-6">
      <div className="max-w-5xl mx-auto text-center">
        <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
          Learn New Skills, Advance Your Career
        </h1>
        <p className="mt-6 text-lg md:text-xl max-w-2xl mx-auto text-muted-foreground">
          Access high-quality courses taught by industry experts and transform
          your knowledge into real-world skills.
        </p>
        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Button size="lg" asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
          <Button size="lg" variant="outline" asChild>
            <Link href="/signup">Sign Up Free</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
