---
id: what-is-resift
title: What is ReSift?
sidebar_label: What is ReSift?
---

> 👋 **Too many words? Head over to the [Quick glance](./quick-glance.md)** 👉

**ReSift is a state management library for fetches** with the goal of giving your team a capable standard for fetching, storing, and reacting to data.

We like to think of ReSift as the [Relay](https://relay.dev/) of REST. ReSift is in the same class of tools as [Relay](https://relay.dev/) and [the Apollo Client](https://www.apollographql.com/docs/react/). However, ReSift does _not_ require GraphQL.

[See this doc for definitions and comparisons of ReSift vs Relay/Apollo](../guides/resift-vs-apollo-relay.md).

## Motivation

When developing a React application, you might realize that there is a lot more than meets the eye regarding data fetching.

With every fetch we need to know:

- If the data request is inflight (so we can show a loading indicator)
- Where the resulting data will be stored, and how to later retrieve it
- If it's related to other fetches so they update consistently
- If the response was an error so we can try to recover

These tasks themselves aren't overly complicated, but doing them over and over and over again _will_ take time away from your product.

To make matters worse, there is an infinite number of ways to accomplish said tasks, and managing these differences while working on a team can be confusing and hard to manage.

## Introducing ReSift

ReSift is a capable and versatile library for data fetches. ReSift is opinionated where it matters but also pluggable to suit your different data fetching needs.

**Features:**

- 💾 Framework for storing and retrieving responses from data requests
- 📬 Monitoring and updating the status of inflight requests
- 🔌 Pluggable via custom "data services"
- 🌐 Universal — Share code amongst your apps. **Works with React Native!**
- 🎣 Hooks API
- 🤝 Full TypeScript support
  <!-- - 📅 Coming soon: Experimental Suspense and Concurrent Mode support -->
