# Job Queue

Build a work queue system with priority ordering, retry logic with exponential backoff, and visibility timeouts.

This problem models the job processing infrastructure used in background task systems like Celery, Bull, and AWS SQS. You'll implement FIFO queuing, priority lanes, retry policies, and visibility timeout mechanics.

## What You're Building

A class called `JobQueue` that starts with basic FIFO queuing and progressively adds priority ordering, retry with dead letter queue, and visibility timeout for concurrent consumers.

## Levels

1. **Basic FIFO Queue** -- Enqueue, dequeue, complete, and fail jobs
2. **Priority Queues** -- Higher priority jobs are dequeued first
3. **Retry + Dead Letter Queue** -- Failed jobs retry with exponential backoff
4. **Visibility Timeout** -- Jobs become invisible during processing, auto-return on timeout
