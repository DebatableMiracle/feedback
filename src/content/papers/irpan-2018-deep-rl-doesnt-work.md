---
title: Deep Reinforcement Learning Doesn't Work Yet
authors: Irpan
year: 2018
topic: Reinforcement Learning
tags:
  - rl
  - critique
  - sample-efficiency
url: 'https://www.alexirpan.com/2018/02/14/rl-hard.html'
source: 'ETHZ Robot Learning 2026 — Week 2: Robot Control & MDPs'
tldr: >-
  Honest catalogue of deep RL's problems: sample inefficiency, brittleness,
  reward hacking, and the gap between benchmark performance and real-world use.
read: false
published: true
date: 2026-06-23T21:40:37.784Z
---
"A friend is training a simulated robot arm to reach towards a point above a table. It turns out the point was defined _with respect to the table_, and the table wasn’t anchored to anything. The policy learned to slam the table really hard, making the table fall over, which moved the target point too. The target point _just so happened_ to fall next to the end of the arm."
