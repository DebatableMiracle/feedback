---
type: article
title: RT-1
description: Paper Overview and my notes for Robotic Transformer 1
date: 2026-01-01T20:00:00
tags:
  - VLA
  - AI
  - robotics
  - RT-I
published: false
project: "Vision Language Model: Overview and Implementation"
---
*RT-1 is considered a pretty foundational model for the current VLA paradigm starting a massive shift from Imitation learning based methods to a Transformers based generalization approach. 
I'll go through the paper and write my understanding and possibly the code I hope. 
This is just an initial write up based on all the details I gather and learn throughout the paper which I find important and interesting to the paper. (That is, I have no idea if this would be a good read for general  robotics audience or would only work as personal notes)*

### The need
So, RT-1 was started as large foundational models have been able to generalise very well on text and images till now as seen in Large Language Models and Vision Language Models. Earlier robotics AI efforts included Reinforcement Learning or Imitation Learning involved collecting task-specific datasets in usually single tasks settings which didn't really provide generalising over varied tasks. And hence transformer based task-agnostic high capacity architectural models trained on large scale datasets were needed. The task is to create a single capable model that can do wide varieties of robotics tasks and can it zero shot generalise over new tasks and environments?

#### Preliminaries 
As the paper suggests, three major preliminaries to the build up to this were:

*Robotic Learning:*  Sort of like an MDP (a Markov Decision Problem) based methods. The task is to learn policy $\pi$  (a mapping of action taken/or distribution of actions for a set of observation/state, say images). The major idea is we take a sequential decision making environment and at t=0 and We give the policy a set of instructions $i$  and initial observation like camera image $x_0$ . The policy then produces an action distribution of $\pi(\cdot \mid i, x_0)$  from which we sample action $a_0$  and the robot performs that action. Now this cycle is repeated for t=T which is the end of the episode which is usually the termination condition (You can end the episode at a fix time, say 30 seconds or you finish the task when your objective is finished, these are some termination conditions). You create a reward system, based on your objective and instructions. The goal is to learn a policy $\pi$ that maximises the average reward, in the environment given a set of instructions and observed state, starting state $x_0$ .

*Transformers:* The holy grail of LLMs and AI in general at this point. RT-1 uses transformers to represent a policy $\pi$ . Transformers basically take an input sequence to produce output sequence or tokens using attention mechanism and feedforward layers to learn a mapping of the tokens. Though original paper intended it work for text as tokens, we've come a long way with applying images, audio, actions as tokens to create longer token sequences. That's basically the core of RT-1, taking in the instruction $i$ and state observation $x_0$ (the camera images) as inputs and producing action tokens $a_t$ representing motor commands. 

*Imitation Learning:* As the name suggests, imitation learning copies a set of demonstration. Mathematically speaking, we train a policy $\pi$  on a dataset $D$ of demonstrations for N successfull episodes of the task and then we use behavioural cloning, which in simple terms is optimizing $\pi$ by minimizing negative log-likelihood of actions $a_t$ given images and instructions (I'd later call all of these state observation, as everyone else does so lock in).

### System Overview
As you already understand by now, the goal is to create a learning system that generalizes effectively absorbing large amounts of data, like we do. So the Google team used Robotic arms from Everyday Robots, with both virtual and real environments of a kitchen and then used human annotated and performed actions to make large datasets of different types of actions. They collected large datasets, the largest packed with 130k individual demonstrations, 700 different task instructions. However, to actually make a usable model, you need a very efficient architecture that learns large amount of data, generalize and then produce actions in real time speeds. Hence, they made the RT-1 architecture which I'll explain in the next section.

# RT-1
The model is based on Transformers architecture and takes a history of of images and task description as input and directly outputs tokenized actions. The architecture works in following steps to achieve a data efficient and compact tokenization:

***Instructions and Image tokenization:*** 
The model tokenizes a history of 6 images (since a single image can only decode position, multiple images give information about motion history speed and acceleration, in DQN based RL models solving Atari, Deepmind used 4 images, similar concept is used here). These images are passed as inputs of 300 $\times$ 300 shaped images to ImageNet pretrained EfficientNet-B3 model and output a spatial feature map of the shape 9 $\times$ 9 $\times$ 512 from the final convolution layer. This acts as a visual encoder, encoding the visual information into tokens. Then they flatten the output feature map from the EfficientNet into 81 visual tokens which are passed on to the later layers of the network. 
Another important aspect is how to include language instructions, they condition image tokenizer on Language instruction in the form of pretrained language embedding which allows the tokenizer to extract only task related information from the image improving efficiency. The language instruction is first embedded via a Universal Sentence Encoder, this embedding is then used as an input to identify Feature-wise Linear Modulation (FiLM layers) letting the network emphasize task relevant regions.
RT-1’s image and instruction tokenization via FiLM EfficientNet-B3 is a total of 16M parameters,
with 26 layers of MBConv blocks and FiLM layers, which output 81 vision-language tokens.
***Token Learner:***

### Relevant reads
BC - Z a
Gato (reed et al)