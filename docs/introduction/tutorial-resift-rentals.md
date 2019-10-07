---
id: tutorial-resift-rentals
title: Tutorial: ReSift Rentals
sidebar_label: Tutorial
---

Welcome to the ReSift tutorial. This tutorial will introduce basic ReSift concepts through building an app called _ReSift Rentals_ that lets you browse movies, kinda like Netflix. The [complete ReSift Rentals app](https://6xrby.csb.app/) has the following functionalities:

- It fetches genre data and presents the genre name and the thumbnails of the movies in each genre.
- It optimizes performance by only fetching data _when needed/in batches_.
  - In the initial load, it fetches 10 movies for each category to show their movie thumbnails. It’ll fetch the next batch of 10 movies when you scroll past the previous batch.
  - In the genre fetch, it only fetches the movie data needed for movie thumbnail (movie id, name, and imageUrl). When you hover over or click the thumbnail is when it’ll fetch the rest of the movie data, such as synopsis, preview url, etc.
- It provides consistency when the movie information is updated—when the movie information is edited in the editing dialog, that information gets updated globally, allowing the information in the movie drawer to change accordingly.
- It responds to users’ actions instantly by giving them indications about the data loading status.

## Before We Start the Tutorial

In making of this tutorial, we assume that you have basic understanding of React and React Hooks. To gain this knowledge, we recommend following the [React tutorial](https://reactjs.org/tutorial/tutorial.html) and [this post that explains React Hooks](https://www.robinwieruch.de/react-hooks).

We used a few third party libraries to help with certain functionalities and we’ll introduce them when they are being used, you do not need prior knowledge about them.

This tutorial is divided into 8 sections with each introduces different ReSift concepts. Every section has their own starter code and finished code. The starter code has the needed components and styling already provided so we can focus on introducing data fetches using ReSift. The following list is a quick glance of each section and the main concepts they introduce. You can pick and choose the concepts you’d like to understand and start at any sections. Instead of following the tutorial, you can also look at the finished code as examples of using ReSift.

**[Setup & Overview](#setup-overview)**</br>
Gives a starting point to follow the tutorial.

**[Section 1: Making Your First Fetch – Fetch Genres and Display Loading Indicator](#section-1-making-your-first-fetch-fetch-genres-and-display-loading-indicator)**</br>
Main concepts: Singleton data fetch, dispatch data, and indicate loading status
Main ReSift API introduced: `defineFetch` , `useFetch`, `useDispatch`, `isNormal`, `isLoading`, `status`

**[Section 2: Display Movies in Each Genre](#section-2-display-movies-in-each-genre)**</br>
Main concepts: Generate unique genre fetch instances via the same fetch factory
Main ReSift API introduced: `key`

**[Section 3: Infinite Scrolling & Pagination](#section-3-infinite-scrolling-pagination)**</br>
Main concepts: Fetch data in batches and merge data in the current fetch with data from the previous fetches
Main ReSift API introduced: `merge`

**[Section 4: Display Movie Info in a Movie Drawer](#section-4-display-movie-info-in-a-movie-drawer)**</br>
Main concepts: Generate unique movie fetch instances via one fetch factory
Main ReSift API introduced: Practice similar concepts as section 2

**[Section 5: Fetch Movie Data when Hovering over Movie Thumbnail](#section-5-fetch-movie-data-when-hovering-over-movie-thumbnail)**</br>
Main concepts: Dispatch fetch when events fired
Main ReSift API introduced: `useDispatch`

**[Section 6: Edit Movie](#section-6-edit-movie)**</br>
Main concepts: Creating a fetch factory to update movie info and keeping that info in sync
Main ReSift API introduced: `share`

**[Section 7: Compose Custom Hooks](#section-7-compose-custom-hooks)**</br>
Main concepts: Improve code clarity through composing custom hooks
Main ReSift API introduced: How ReSift uses hooks

**[Section 8: Create a Mock API using the ReSift HTTP Proxy](#section-8-create-a-mock-api-using-the-resift-http-proxy)**</br>
Main concepts: Set up mock api endpoints
Main ReSift API introduced: `createHttpProxy`

**[Where to Go from Here](#where-to-go-from-here)**</br>
Provides some additional exercises and examples of using ReSift

And at point of this tutorial you run into any hurdle, please don't be hesitant to leave us an issue.

Now let's dive in!
![dive in](https://media.giphy.com/media/1lxkgpEvs7pmlddf9D/giphy.gif)
