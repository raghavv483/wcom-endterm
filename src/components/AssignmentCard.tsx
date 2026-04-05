import { Link } from "react-router-dom";
import { Assignment } from "@/data/assignments";
import { TagBadge } from "./TagBadge";

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  return (
    <Link to={`/assignments/${assignment.slug}`}>
      <div className="group h-full rounded-lg border border-border bg-card p-6 transition-all hover:shadow-lg hover:border-primary/50">
        {/* Assignment Number */}
        <div className="mb-3 inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary font-bold text-lg">
          {String(assignment.id).padStart(2, "0")}
        </div>

        {/* Title */}
        <h3 className="mb-3 text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
          {assignment.title}
        </h3>

        {/* Short Description */}
        <p className="mb-4 text-sm text-muted-foreground line-clamp-2">
          {assignment.shortDesc}
        </p>

        {/* Tags */}
        <div className="mb-4 flex flex-wrap gap-2">
          {assignment.tags.slice(0, 2).map((tag) => (
            <TagBadge key={tag} label={tag} />
          ))}
          {assignment.tags.length > 2 && (
            <span className="text-xs text-muted-foreground">+{assignment.tags.length - 2}</span>
          )}
        </div>

        {/* View Link */}
        <div className="text-sm font-medium text-primary group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
          View Assignment <span>→</span>
        </div>
      </div>
    </Link>
  );
}
