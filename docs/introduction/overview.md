---
id: overview
title: Resift
sidebar_label: Overview
---

The most difficult thing about front-end development has got to be state management. We have to juggle all these conditions and make sure our apps respond accordingly.

It comes with no surprise that managing the state of data fetches is very involved.

With every fetch we need to know:

- If the data request is inflight so we can show a loading indicator
- Where to store the data and how to look it up
- If the response is an error so we try to recover
- If the fetch is related to other fetches so we can ensure they update consistently

# What is Resift?

Simply put, **Resift is a state management library for fetches** with the goal of giving your team a capable standard for fetching and storing data consistently.

Features:

- 💾 Framework for storing and retrieving responses from data requests
- 📬 Monitoring and updating the status of inflight requests
- 🔌 Pluggable via custom "fetch services"
- 🎣 Hooks API
- ⚛️ Optional Redux integration with Redux dev tools support
