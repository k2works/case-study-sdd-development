import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import HomePage from "./page";

describe("HomePage", () => {
  it("renders app entry points", () => {
    render(<HomePage />);

    expect(screen.getByText("Fleur Memoire Workspace")).toBeInTheDocument();
    expect(screen.getByText("Customer Shop")).toBeInTheDocument();
    expect(screen.getByText("Admin Console")).toBeInTheDocument();
  });
});
