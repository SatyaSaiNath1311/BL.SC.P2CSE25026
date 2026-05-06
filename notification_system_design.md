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

## Stage 2

### Frontend Architecture
For Stage 2, I built a responsive web application using **React** and **TypeScript**. To make it look clean and professional, I used **Material UI (MUI)** components.

### Features
1. **Notifications Page**: Displays all notifications with support for pagination and type filtering (Placement, Result, Event) using the updated API parameters.
2. **Priority Page**: Displays the top ranked notifications using the same logic from Stage 1. I added a slider so you can choose how many top notifications to see.
3. **Read/Unread Tracking**: I used `localStorage` to keep track of which notifications the user has clicked on. Unread notifications have a blue highlight on the side and bold text.
4. **Logging**: I created a frontend logging utility that sends logs back to the evaluation server whenever the user loads a page or an API call is made.

### Running the app
The app is configured to run on `http://localhost:3000`. 
To start it:
```bash
cd notification_app_fe
npm install
npm run dev
```
