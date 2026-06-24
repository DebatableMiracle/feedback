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
This paper talks a lot about the failures and more importantly the challenges of Deep Reinforcement Learning, came out in 2018 it talks about the issues back then about sample inefficiency, reward structuring/hacking, generalization, I really like Alex Irpan, been exploring his works for a while now. Anyways the blogpost talks a lot about why RL was, and still is, so inneficient at so many tasks and is usually a narrow fit for a single task rather than the dream of AGI  which I personally beleive in too. The idea that key to a single generalizable policy comes from RL, even after so much VLAs and IL working way better than RL, I kinda beleive in it too. Although he did not have  the empirical results I see today, I think he also dealt with the same issue I am dealing with lol. RL kinda sucks!

One of the cool observation is how unstable, Deep RL learning is, and can often go bad just coz of a different random seed. Deep RL agents, often decide to learn the weirdest unintentional local optimas instead of finding the global ones. Which is not wrong but at the same time, what we need is to find local optimas better than our human baselines, which is really hard to come by from then, and even current exploration methods. I think I wanna explore curiosity even more after  



#### Some selected texts from the article that I likedd
"A friend is training a simulated robot arm to reach towards a point above a table. It turns out the point was defined _with respect to the table_, and the table wasn’t anchored to anything. The policy learned to slam the table really hard, making the table fall over, which moved the target point too. The target point _just so happened_ to fall next to the end of the arm."

"A researcher gives a talk about using RL to train a simulated robot hand to pick up a hammer and hammer in a nail. Initially, the reward was defined by how far the nail was pushed into the hole. Instead of picking up the hammer, the robot used its own limbs to punch the nail in. So, they added a reward term to encourage picking up the hammer, and retrained the policy. They got the policy to pick up the hammer…but then it threw the hammer at the nail instead of actually using it."

"There are several intuitively pleasing ideas for addressing this - intrinsic motivation, curiosity-driven exploration, count-based exploration, and so forth. Many of these approaches were first proposed in the 1980s or earlier, and several of them have been revisited with deep learning models. However, as far as I know, none of them work consistently across all environments. Sometimes they help, sometimes they don’t. It would be nice if there was an exploration trick that worked everywhere, but I’m skeptical a silver bullet of that caliber will be discovered anytime soon. Not because people aren’t trying, but because exploration-exploitation is really, really, really, really, really hard. To quote [Wikipedia](https://en.wikipedia.org/wiki/Multi-armed_bandit),

> Originally considered by Allied scientists in World War II, it proved so intractable that, according to Peter Whittle, the problem was proposed to be dropped over Germany so that German scientists could also waste their time on it.

(Reference: [Q-Learning for Bandit Problems, Duff 1995](http://citeseerx.ist.psu.edu/viewdoc/download?doi=10.1.1.57.1916&rep=rep1&type=pdf))"


"Deep RL is popular because it’s the only area in ML where it’s socially acceptable to train on the test set." - Quote to live by

(See [Universal Value Function Approximators, Schaul et al, ICML 2015](http://proceedings.mlr.press/v37/schaul15.pdf).