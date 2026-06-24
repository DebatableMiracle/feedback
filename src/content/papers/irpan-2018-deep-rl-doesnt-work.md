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
This paper talks a lot about the failures and more importantly the challenges of Deep Reinforcement Learning, came out in 2018 

"A friend is training a simulated robot arm to reach towards a point above a table. It turns out the point was defined _with respect to the table_, and the table wasn’t anchored to anything. The policy learned to slam the table really hard, making the table fall over, which moved the target point too. The target point _just so happened_ to fall next to the end of the arm."

"A researcher gives a talk about using RL to train a simulated robot hand to pick up a hammer and hammer in a nail. Initially, the reward was defined by how far the nail was pushed into the hole. Instead of picking up the hammer, the robot used its own limbs to punch the nail in. So, they added a reward term to encourage picking up the hammer, and retrained the policy. They got the policy to pick up the hammer…but then it threw the hammer at the nail instead of actually using it."
