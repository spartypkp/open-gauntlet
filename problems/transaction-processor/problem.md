# Banking System

Build a banking system that manages accounts, processes transfers, schedules future payments, and maintains a complete transaction history.

This problem models core fintech infrastructure: account management, atomic transfers, lazy payment execution, and account merging with historical queries. Used by Coinbase, Ramp, and eBay in their CodeSignal ICF assessments.

## What You're Building

A class called `TransactionProcessor` that starts with basic account operations and progressively adds transfer ranking, scheduled payments, and account merging with historical balance queries.

## Levels

1. **Core Account Operations** -- Create accounts, deposit funds, and transfer between accounts
2. **Top Spenders** -- Rank accounts by total outgoing transfer volume
3. **Scheduled Payments** -- Queue future transfers that fire lazily before each new operation
4. **Account Merge + History** -- Merge accounts and query historical balances at any past timestamp
