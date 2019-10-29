---
id: resift-vs-apollo-relay
title: ReSift vs Apollo and Relay
sidebar_label: ReSift vs Apollo and Relay
---

## What are Apollo and Relay?

Similar to ReSift, the Apollo client and Relay are state management libraries for fetches. They have the same goals as ReSift. However, the biggest distinction between Apollo and Relay and ReSift is that Apollo and Relay are GraphQL clients. This means that you must to use GraphQL if you want to use Apollo or Relay.

## ReSift vs Apollo/Relay

ReSift has the same responsibilities as the Apollo client and Relay. The Apollo client, Relay, and ReSift function as libraries that handle fetching, caching, and reporting the status of inflight requests. They're are all global state containers that will hold the state of your data fetches outside of your component tree.

ReSift is has one major advantage: **ReSift does _not_ require GraphQL**.

ReSift is agnostic on how to get data. You can use traditional RESTful services, local or async storage, and [even GraphQL too](../main-concepts/what-are-data-services.md#writing-a-data-service).

However, the since Apollo and Relay are GraphQL only, they can leverage data schemas from GraphQL to normalize incoming data inside their caching solutions automatically. This means that if you update a piece of information using Apollo or Relay, that piece of information will update anywhere it's used.

This is the major trade off of ReSift — because ReSift doesn't have schema information, **ReSift _can't_ automatically normalize your data**.

Instead of requiring schemas, **ReSift allows you specify how a piece of information should be updated when another piece of information changes**. See the [Sharing state between fetches](../main-concepts/sharing-state-between-fetches.md#merges-across-namespaces) doc for more info.

We believe this is sufficient for creating data-driven applications and a great alternative to Apollo and Relay.

(However, if you are using GraphQL, we recommend you just use Apollo or Relay.)

## Comparison chart

| Feature 👇                    | ReSift | Relay | Apollo |
| ----------------------------- | ------ | ----- | ------ |
| Global cache/global injection | ✅     | ✅    | ✅     |
| Automatic pending status      | ✅     | ✅    | ✅     |
| Automatic normalization       | 🔴     | ✅    | ✅     |
| Compatible with REST          | ✅     | 🔴    | 🔴     |
