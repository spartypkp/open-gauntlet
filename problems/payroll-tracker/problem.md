# Payroll Tracker

Build a system that tracks when contract workers are in the office, calculates their total time worked, and computes salary based on compensation rates and promotions.

This problem models core HR and payroll primitives: time tracking, rate changes over time, and period-based salary calculation with special compensation rules. Used by Ramp in their CodeSignal ICF assessment.

## What You're Building

A class called `PayrollTracker` that registers worker entry/exit events, tracks promotion history, and computes salaries with support for double-pay periods.

## Levels

1. **Worker Registration** -- Register workers and track their office time
2. **Top Workers** -- Rank workers by total time worked
3. **Salary Calculation** -- Compute salary for a period with promotion history
4. **Double Pay** -- Apply 2x compensation for designated time ranges
