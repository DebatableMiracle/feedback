---
title: Sutton & Barto (Reinforcement Learning)
authors: Richard S. Sutton & Andrew G. Barto
description: >-
  Uhh well, just the most cited and popular book to get into Reinforcement
  Learning.
status: reading
date: 2026-08-06T12:39:44.191Z
tags:
  - reinforcement-learning
  - books
published: true
---

## Links

- [Reinforcement Learning: An Introduction (2nd Edition)](http://incompleteideas.net/book/the-book-2nd.html)

## Notes

### 1. Introduction

> One of the most exciting aspects of modern reinforcement learning is its substantive
> and fruitful interactions with other engineering and scientific disciplines. Reinforcement
> learning is part of a decades-long trend within artificial intelligence and machine learning
> toward greater integration with statistics, optimization, and other mathematical subjects.
> For example, the ability of some reinforcement learning methods to learn with parameter-
> ized approximators addresses the classical "curse of dimensionality" in operations research
> and control theory.

> It is in this role that we have the greatest need for supervised learning
> methods within reinforcement learning. (pg 12)

This is one of the things I personally believe when talking about RL is that, it's not the cherry on top of Supervised Learning but Supervised learning is the necessary means to make RL work, which in lots of ways would be far superior than any of the Intelligence in purely supervised AI.

> Exercise 1.1: Self-Play Suppose, instead of playing against a random opponent, the
> reinforcement learning algorithm described above played against itself, with both sides
> learning. What do you think would happen in this case? Would it learn a different policy
> for selecting moves?

> Exercise 1.2: Symmetries Many tic-tac-toe positions appear different but are really
> the same because of symmetries. How might we amend the learning process described
> above to take advantage of this? In what ways would this change improve the learning
> process? Now think again. Suppose the opponent did not take advantage of symmetries.
> In that case, should we? Is it true, then, that symmetrically equivalent positions should
> necessarily have the same value?

> Exercise 1.3: Greedy Play Suppose the reinforcement learning player was greedy, that is,
> it always played the move that brought it to the position that it rated the best. Might it learn to play better, or worse, than a nongreedy player? What problems might occur?

> Exercise 1.4: Learning from Exploration Suppose learning updates occurred after all
> moves, including exploratory moves. If the step-size parameter is appropriately reduced
> over time (but not the tendency to explore), then the state values would converge to
> a different set of probabilities. What (conceptually) are the two sets of probabilities
> computed when we do, and when we do not, learn from exploratory moves? Assuming
> that we do continue to make exploratory moves, which set of probabilities might be better
> to learn? Which would result in more wins?

> Exercise 1.5: Other Improvements Can you think of other ways to improve the reinforce-
> ment learning player? Can you think of any better way to solve the tic-tac-toe problem
> as posed?

There's a lot of references and to-read to develop from this book.
