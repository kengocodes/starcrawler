import React from "react";
import { render, fireEvent, screen } from "@/lib/test-utils";
import { describe, it, expect, vi } from "vitest";
import { Slider } from "@/components/crawl/slider";

describe("Slider edge cases", () => {
  it("handles zero-width track without jumping to end", () => {
    const onChange = vi.fn();
    const onCommit = vi.fn();
    const value = 0.3;

    render(
      <div style={{ width: 0 }}>
        <Slider
          value={value}
          onChange={onChange}
          onCommit={onCommit}
          ariaLabel="Test Slider"
        />
      </div>
    );

    const slider = screen.getByRole("slider", { name: /test slider/i });
    const track = slider.parentElement!;

    // Stub getBoundingClientRect to simulate zero-width track
    const original = track.getBoundingClientRect;
    track.getBoundingClientRect = () =>
      ({ left: 0, width: 0 } as DOMRect) as DOMRect;

    // Press on the track
    fireEvent.pointerDown(track, { clientX: 50, pointerId: 1 });

    // Should not jump; should use current value as fallback
    expect(onChange).toHaveBeenCalled();
    expect(onChange.mock.calls[0][0]).toBeCloseTo(value, 5);
    expect(onCommit).toHaveBeenCalled();
    expect(onCommit.mock.calls[0][0]).toBeCloseTo(value, 5);

    // Restore
    track.getBoundingClientRect = original;
  });
});


