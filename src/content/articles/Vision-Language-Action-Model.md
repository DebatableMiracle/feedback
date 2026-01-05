---
type: article
title: "What is a VLA: An overview"
description: A theoretical deep dive into VLA models.
date: 2026-01-03T12:00:00
tags:
  - VLA
  - robotics
published: false
project: "Vision Language Model: Overview and Implementation"
---
### The core need for a Vision Language Action Model for Robots

Robots have become noticeably capable over the past decade. However, despite the fast AI evolution since Transformers based models broke through the scene, you might feel Robots have not really advanced as you'd expect. While systems like ChatGPT feel so useful and AI assistants,  like Siri and Gemini, slowly taking over our daily lives, Robots haven't really become mainstream out of labs. 

The primary reason for this gap is that Robotics is a much harder and complex problem than just predicting the next word. While GPT models can essentially be called hyper-charged auto-completion, Robots have to use real world sensors, such as noisy cameras, IMUs as input cues and imperfect actuators like servos and motors to actually move, processing this information in real time to actually complete a task. As easy as it sounds... perception, state estimation, controls  are very complex problems and their own and are considered far from solved.

A robot needs to make these decisions every millisecond in robotics, while accounting for noise, delay and uncertainty. While for Language models, the model reasons over a discrete, well structured token space, Robots compress 3D models of real world into their own observatory model of internal understanding and continuously act upon them. This mismatch between computational abstractions and messy physical reality is a central challenge in robotics.

For the longest time, Classical robotics addressed these complexities  through pipelines, treating perception, control and planning as separate components. While effective in structured environments, these pipelines rely on hand-engineered representations and rigid interfaces, making them brittle to noise and distribution shifts. Errors introduced at early stages would propagate through the system leading to compounding failures, which are pretty difficult to correct.

This brought in Deep Reinforcement Learning as a very important advancement in using Neural Networks for learning action perception correlations directly from data. However, RL  itself remains sample-inefficient for real world settings, and while it can generalise for narrowly defined tasks and reward structures, it does not, by itself, provide an architecture for  learning general-purpose robotic behaviour across diverse tasks and hardware.

Considering high cost of  training real robots and how Transformers have transformed (yes) in large-scale sequential modelling, it became natural to model robotic behaviour as a sequence that jointly conditions on visual observations, language instructions, and action history. In the past 2 years, we have witnessed some *Vision Language Action* models demonstrating ability to generalise across tasks, environments, and even robotic platforms, while remaining adaptable to new hardware through fine-tuning.

## What Vision Language Action actually means?


## Pre VLA to VLA 

## VLAs vs VLMs vs Classical RL
## How VLA actually works: a high level abstraction

## How to represent the "Actions"
(This Matters More Than You Think)

## Learning Paradigms Behind VLAs

## Current Situtation

## next??

Source:
Core: Imitation learning and need of the vision etc. i.e. general 
https://arxiv.org/abs/2202.02005 Imitation learinng (BC-Z 2022)
https://arxiv.org/abs/1603.02199 Hand eye coordination paper 2018 s levine et al
Sequence modelling
https://arxiv.org/abs/2106.01345 “Decision Transformer: Reinforcement Learning via Sequence Modeling” (Chen et al., 2021)

Early VLA
“RT-1: Robotics Transformer for Real-World Control at Scale” (2022) https://arxiv.org/abs/2212.06817
https://arxiv.org/abs/2307.15818 RT-2: Vision-Language-Action Models Transfer Web Knowledge to Robotic Control

https://arxiv.org/abs/2005.01643 Offline Reinforcement Learning: Tutorial, Review, and Perspectives on Open Problems