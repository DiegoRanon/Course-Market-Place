import { render, screen } from "@testing-library/react";
import Hero from "../app/components/Hero";
import CategoryGrid from "../app/components/CategoryGrid";
import StatsGrid from "../app/components/StatsGrid";
import CourseGrid from "../app/components/CourseGrid";
import { expect, test, describe, beforeEach } from "@jest/globals";

// Mock next/image to prevent test issues
jest.mock("next/image", () => ({
  __esModule: true,
  default: (props) => {
    // eslint-disable-next-line jsx-a11y/alt-text
    return <img {...props} />;
  },
}));

const mockFeaturedCourses = [
  {
    id: "1",
    title: "Introduction to Web Development",
    description: "Learn the fundamentals of web development",
    price: 49.99,
    thumbnail_url: "/test-image.jpg",
    category: "Web Development",
    users: { name: "John Doe" },
  },
  {
    id: "2",
    title: "Data Science Fundamentals",
    description: "Master the basics of data science",
    price: 59.99,
    thumbnail_url: "/test-image.jpg",
    category: "Data Science",
    users: { name: "Jane Smith" },
  },
];

describe("Hero Component", () => {
  beforeEach(() => {
    render(<Hero />);
  });

  test("renders headline and subheading", () => {
    expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    expect(screen.getByText(/learn new skills/i)).toBeInTheDocument();
  });

  test("renders call-to-action buttons", () => {
    const browseButton = screen.getByRole("link", { name: /browse courses/i });
    expect(browseButton).toBeInTheDocument();
    expect(browseButton.getAttribute("href")).toBe("/courses");
  });
});

describe("CategoryGrid Component", () => {
  beforeEach(() => {
    render(<CategoryGrid />);
  });

  test("renders all category cards", () => {
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
  });

  test("each category has a name and count", () => {
    const categories = screen.getAllByTestId("category-card");
    categories.forEach((category) => {
      expect(category).toHaveTextContent(/courses/i);
    });
  });
});

describe("CourseGrid Component", () => {
  beforeEach(() => {
    render(
      <CourseGrid courses={mockFeaturedCourses} title="Featured Courses" />
    );
  });

  test("renders the section title", () => {
    expect(screen.getByText("Featured Courses")).toBeInTheDocument();
  });

  test("renders all course cards", () => {
    expect(
      screen.getByText("Introduction to Web Development")
    ).toBeInTheDocument();
    expect(screen.getByText("Data Science Fundamentals")).toBeInTheDocument();
  });

  test("course cards display correct information", () => {
    expect(screen.getByText("$49.99")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("Web Development")).toBeInTheDocument();
  });
});

describe("StatsGrid Component", () => {
  beforeEach(() => {
    render(<StatsGrid />);
  });

  test("renders statistics items", () => {
    expect(screen.getAllByTestId("stat-item").length).toBeGreaterThan(0);
  });

  test("each stat has a number and description", () => {
    const stats = screen.getAllByTestId("stat-item");
    stats.forEach((stat) => {
      expect(stat.querySelector("h3")).toBeInTheDocument();
      expect(stat.querySelector("p")).toBeInTheDocument();
    });
  });
});
