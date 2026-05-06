# Notification System Design

This file explains how the campus notification system is built across different stages.

## Stage 1

### Approach
The goal for stage 1 was to create a Priority Inbox to make sure students don't miss important notifications. I wrote a python script (`priority_inbox.py`) that fetches all the notifications from the given API and then filters out the top 10 most important ones.

### How the scoring works
To find the top 10, I used two factors:
1. **Weight**: 
   - Placement = 3 points
   - Result = 2 points
   - Event = 1 point
2. **Recency**: 
   - I calculated how new a notification is by giving the newest one a score of 1.0 and the oldest a score of 0.0.

Then I just added them together: `Total Score = Weight + Recency Score`.

### Code logic
Instead of sorting all the notifications every time (which would be slow if there are thousands of them), I used a min-heap from python's `heapq` module. It keeps track of the top 10 items easily, and whenever a new notification comes in, it just checks if the score is higher than the lowest one in the heap. This makes the code very fast and efficient.
