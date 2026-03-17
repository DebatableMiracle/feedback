---
type: article
title: Building a super easy VLA!
description: Now I will go on and work out the code and mathematics behind a basic VLA, looking at different resources.
date: 2026-03-14T20:00:00
tags: []
published: true
project: "Vision Language Model: Overview and Implementation"
---
*This article is a parallel write-up for my initial version of EasyVLA when I decided to build a VLA for my laptop and test it on some benchmarks. I assume future versions would have a different codebase and structure but this is basically how I structured my first versions. They were actually not that bad! Have fun reading and building this if you like*

>  **Project Repository:** https://github.com/DebatableMiracle/EasyVLA  
> The project in the following article can be accessed here. You'd definitely see some big changes than what article presents, mostly for performance improvements and ease of use, but you can definitely follow the article to build the basic VLA architecture from scratch. 

# A little bit of intro!

So I have worked a good chunk of my past research works in Reinforcement Learning and RL policies are awesome. I love working with these and engineering their rewards. They're surprisingly clever, and you can engineer teamwork and swarm behaviours which is amazing to think about.
BUT there is a fundamental limitation, you train a model to pick up a block and it'll only know how to pick up a block. You can't just tell it, push the drawer, it doesn't reason or think exactly (which arguably LLMs don't but they take human instructions).
The policies don't understand language and cannot reason about new tasks outside what they were trained for. Traditional RL policies operate as task specific controllers and not general-purpose agents.
Large Language Models, on the other hand brought us this amazing idea of a model that understands language instructions and can reason through those.While this isn't true reasoning and is closer to pattern completion in embedding space, it still produces behavior that resembles reasoning because of the structure learned within that embedding space.

LLMs brought us an interesting idea: what if robots could use language-model–like reasoning to act? At first glance, it might sound simple — just plug ChatGPT into a robot and let it move around. But that severely underestimates what our brain actually does. Humans constantly perceive and reason about the physical world: depth, weight, friction, shape, and forces when interacting with everyday objects. We intuitively know that picking up a pencil requires different motion and force than picking up a ball. This ability to understand the physical world and generalize across objects and tasks is exactly what Vision-Language-Action (VLA) models aim to achieve.

And as the title suggests, I am going to build one — on a 4GB RTX 3050 laptop with 24GB of RAM, a very questionable cooling system, and slightly concerning hinges.

The idea is simple: Vision + Language + State to predict future actions. If you're familiar with the LLM paradigm, we already have VLMs (Vision Language Models) that build contextual understanding from both images and text. A VLA model is essentially a VLM with an additional policy or action head that converts these representations into executable robot actions.
# What we need?

We need a vision encoder to extract visual features from the observations and convert them into visual embeddings.  
Then we map these embeddings into the LLM representation space using a feature adapter or projection layer.
Now the main LLM processes this sequence of vision embeddings + robot state + instruction text (concatenated together and passed through attention layers) and produces new representations, which are then given to an action head that converts the LLM outputs into executable robot commands.
The stack I'm going for will be very small since I'm working with my RTX 3050 laptop.
My current idea is to have:
- **ResNet18** as the vision encoder  
- **DistilBERT** (frozen) as the text encoder
- A small 2–4 layer cross-attention transformer as our backbone  
- A diffusion-based action head  

Lastly, I'm planning to test this in Meta-World environments, but I would also like to try it in other environments as well.
# Encoders

Encoders are components that we use to convert raw inputs into vector representations. 
These vector representations, called **Embeddings** is what we feed into the LLMs.
In robotics, a typical system has 3 major raw inputs: 
- Text instructions, like pick up the block or whatever you want the robot to do.
- Visual Observations, through one or more cameras. An easily interpretative angle is what we like.
- Robot State Observations such as motor's current angle, position or angular velocity, anything relevant to understanding the current state space. In simpler terms, it tells what the robot knows about its own body, like you know that your arms are straight or not.
- 
Understanding robot state does not require deep reinforcement learning knowledge, but having some familiarity with **Markov Decision Processes (MDPs)** and **state spaces** can help provide intuition. In simple terms, the state represents all the information needed for the robot to decide what action to take next.

Now each of these inputs must be encoded into vector embeddings before being processed by the model. 
## Vision Encoder: Resnet18

So I'm planning to use a Resnet18 as our vision encoder. I am using some pretrained weights as this can help our model to understand edges, shapes, boundaries quicker than training from scratch. I also freeze all layers except layer4 as layer4 usually contains more information about high level semantics, such as task specific features.
Our idea is to map an RGB image to vector embeddings, which become our vision tokens.
basically we take an input of x ∈ ℝ^(B × 3 × H × W) and output it as z ∈ ℝ^(B × d_model) through our resnet. 

```python
import torch
import torch.nn as nn
import torchvision.models as models

class VisionEncoderResnet18(nn.Module):
    def __init__(self, d_model = 256):
        super().__init__()
        
        resnet = models.resnet18(pretrained=True)
        self.backbone = nn.Sequential(
            resnet.conv1,
            resnet.bn1,
            resnet.relu,
            resnet.maxpool,
            resnet.layer1,
            resnet.layer2,
            resnet.layer3,
            resnet.layer4,
        )

        for p in self.backbone.parameters():
            p.requires_grad = False
        for p in self.backbone[-1].parameters():
            p.requires_grad = True

        self.pool = nn.AdaptiveAvgPool2d((1, 1))
        self.projection = nn.Linear(512, d_model)
        self.layernorm = nn.LayerNorm(d_model)

    def forward(self, x):
        x = self.backbone(x)
		x = x.flatten(2) # (B,512,49)

		x = x.transpose(1,2) # (B,49,512)
        x = self.projection(x)
        x = self.layernorm(x)
        return x
```

Now explaining the code a little bit. we pass the input images through a pretrained Resnet18 backbone. Instead of using the full classification model, we only use the convolutional layers that extract visual features. 
As i wrote, we freeze all layers except layer4 so the pretrained knowledge such as edges, textures and shape is preserved. Only the final block is left trainable so the model adapts to the higher level visual features of different robotic environments.
After the backbone, we obtain a **feature map of shape** (B,512,H′,W′)where the 512 channels represent different learned visual patterns. 

Instead of collapsing the spatial dimensions using global average pooling, we **preserve spatial structure** by converting the feature map into a sequence of tokens.
After the backbone, we obtain a feature map of shape **(B, 512, H′, W′)**. Each spatial location corresponds to a different region of the image. By flattening this into **N = H′ × W′ tokens**, the model can attend to different parts of the scene independently.
This is important because robotic tasks often depend on **where** objects are, not just what they are. For example, the model should be able to associate the word “target” with a specific region in the image. Keeping spatial tokens allows the transformer to learn these correspondences through attention.
Finally, each 512-dimensional token is projected into the shared embedding space (`d_model`) and normalized before being passed to the fusion module.
## Text Encoder: Distilbert but frozen
I plan to use distilbert as it's great at understanding small instructions while being really small ~66M parameters.

```python
from transformers import DistilbertModel
import torch.nn as nn

class TextEncoderDistilbert(nn.Module):
	def __init__(self, d_model = 256):
		super().__init__()
		self.backbone = DistilbertModel.from_pretrained("distilbert-base-uncased")
		#freeze all the layers
		for p in self.backbone.parameters():

			p.requires_grad = False
		self.projection = nn.Linear(768, d_model)
		self.layernorm = nn.LayerNorm(d_model)
	def forward(self, x):
		x=self.backbone(x).last_hidden_state[:,0]
		x=self.projection(x)
		x=self.layernorm(x)

return x
```

Before encoding the text must be tokenized into sequence of token IDs. Passing these into the pretrained DistilBERT model produces contextual embeddings for each token in the sentence. 

From the output sequence of embeddings, we take the **CLS token representation** (the embedding of the first token), which acts as a summary representation of the entire instruction.

t ∈ ℝ^(B × L)
z_text ∈ ℝ^(B × d_model)

DistilBERT produces embeddings of dimension **768**, which are then projected into the shared multimodal embedding space of dimension `d_model`. This ensures that the text representation is compatible with the vision and state tokens before fusion.

Finally, **Layer Normalization** is applied to stabilize the embedding.

## Robot State Embedding: A simple MLP does the trick

Since the information is very simple numeric data, we don't need fancy models to derive features hence, I'm using a simple MLP 

```python
import torch
import torch.nn as nn

class StateEncoderMLP(nn.Module):
    def __init__(self, state_dim, d_model=256):
        super().__init__()

        self.net = nn.Sequential(
            nn.Linear(state_dim, 128),
            nn.ReLU(),
            nn.Linear(128, d_model),
        )

        self.layernorm = nn.LayerNorm(d_model)

    def forward(self, s):
        x = self.net(s)
        x = self.layernorm(x)
        return x
```

# Multimodal Fusion: Mixing Text, Image and State together


So we have successfully encoded our inputs but we need to figure out what we do with this information! Ideally, we use an LLM with the concatenated encoded vectors of the different observations/instructions but here I'm gonna use a transformer for starters. 

The transformer is ideally supposed to take in all our encoded input (resnet, distilBert, and the state encoder) and then output a single context representation that the policy uses to decide actions. 

My idea is to use a two-stage transformer fusion mechanism that seperates scene understanding from robot grounding. The key intuition behind this design is that not all inputs play the same role. Vision and language together describe the **scene and the task**, while the robot state describes **where the robot currently is inside that scene**. Instead of mixing everything together immediately, we structure the fusion using two types of attention. 

First, the visual and language tokens interact using **self-attention**. Self-attention simply means that every token can look at every other token and decide what information is important. This allows the model to connect the instruction with the scene. For example, the word “target” in the instruction can attend to the visual region where the target object appears. After this step, the model has a contextual understanding of the scene and the task. 

Next, the robot state is introduced using **cross-attention**. In cross-attention, one set of tokens queries another set of tokens. Here, the robot state acts as the query, while the visual–language tokens provide the context. This allows the robot to reason about the scene relative to its own configuration, for example, where the target is with respect to the gripper.

The result of this process is a single context representation that combines **what the robot sees, what it has been asked to do, and where it currently is**. 

```python
import torch
import torch.nn as nn

class FusionTransformer(nn.Module):
    def __init__(self, d_model=256, n_heads=4, n_layers=2, dropout=0.1):
        super().__init__()

        # Self-attention block to build scene context from vision + language
        self_layer = nn.TransformerEncoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=4 * d_model,
            batch_first=True,
            norm_first=True,
            dropout=dropout,
        )

        self.context_encoder = nn.TransformerEncoder(
            self_layer,
            num_layers=n_layers
        )

        # Cross-attention block where state queries the scene context
        cross_layer = nn.TransformerDecoderLayer(
            d_model=d_model,
            nhead=n_heads,
            dim_feedforward=4 * d_model,
            batch_first=True,
            norm_first=True,
            dropout=dropout,
        )

        self.cross_attention = nn.TransformerDecoder(
            cross_layer,
            num_layers=n_layers
        )

        self.layernorm = nn.LayerNorm(d_model)

    def forward(self, vision_tokens, text_tokens, state_tokens):

        # Build scene context from vision + text
        context = torch.cat([vision_tokens, text_tokens], dim=1)

        # Self-attention over visual-language context
        context = self.context_encoder(context)

        # State tokens query the scene using cross-attention
        x = self.cross_attention(
            tgt=state_tokens,   # query
            memory=context      # key/value
        )

        # Output a single fused context vector
        return self.layernorm(x.squeeze(1))
```

Technically It's just a multi-layered transformer, a little off-standard because I wanted to try something. You can use a simple transformer too if you want but it didn't get me very good results so I tried something fun. 

# Diffusion Policies for Robotic Actions

Now we have all the information we need as context representation, but what we need is Robot Actions. Now there have been a lot of approaches for this, earlier models like RT-I predict the future action tokens autoregressively as tokens, like how LLM produces text. In this setup, the model predicts future tokens based on previous tokens, but for such a small architecture and training time, this setup produced a lot of jittery motions (yes, I tried!). 

Another solution is direct regression, where we predict the future tokens using some linear layer or MLP. However, in our 3D world, we encounter situations which have multiple solutions to a task. For example, if the instruction is _reach the target_, the robot could approach the target from slightly different directions. Direct regression tends to average these possibilities, which can lead to unnatural or unstable movements.

Hence what we are gonna use as our Policy Head is essentially the biggest game changer in this segment: a Diffusion Policy, at least a simplified version. 

Diffusion models were originally popularized in generative modeling, where they are used to generate images by gradually removing noise from random samples. The same idea is applied to robot actions. Instead of predicting an action directly, the model learns to **predict the noise added to an action trajectory**. During inference we start from random noise and iteratively denoise it until a valid sequence of robot actions emerges. 

While mathematically involved, the core idea is straightforward: learn to remove noise from action trajectories.  and I might write an article over that too, since I've been planning to write articles over all major developments in VLA and RL. 

```python
# diffusion_head.py
import math
from dataclasses import dataclass
import torch
import torch.nn as nn
import torch.nn.functional as F


@dataclass
class DiffusionConfig:
    T: int = 16
    beta_start: float = 1e-4
    beta_end: float = 1e-2
    action_dim: int = 4
    action_horizon: int = 16   # predict multiple future actions
    cond_dim: int = 256


def make_beta_schedule(cfg: DiffusionConfig):
    betas = torch.linspace(cfg.beta_start, cfg.beta_end, cfg.T)
    alphas = 1.0 - betas
    alpha_bar = torch.cumprod(alphas, dim=0)
    return betas, alphas, alpha_bar


class SinusoidalTimeEmbedding(nn.Module):
    def __init__(self, dim):
        super().__init__()
        self.dim = dim

    def forward(self, t):
        half_dim = self.dim // 2
        device = t.device

        freqs = torch.exp(
            torch.linspace(math.log(1.0), math.log(1000.0), half_dim, device=device)
        )

        args = t.float().unsqueeze(-1) * freqs.unsqueeze(0)

        emb = torch.cat([torch.sin(args), torch.cos(args)], dim=-1)

        if self.dim % 2 == 1:
            emb = torch.cat([emb, torch.zeros_like(emb[..., :1])], dim=-1)

        return emb


class ActionDenoiseModel(nn.Module):
    def __init__(self, cfg: DiffusionConfig, time_emb_dim=32, hidden_dim=256):
        super().__init__()
        self.cfg = cfg
        self.time_emb = SinusoidalTimeEmbedding(time_emb_dim)

        chunk_dim = cfg.action_dim * cfg.action_horizon
        in_dim = chunk_dim + time_emb_dim + cfg.cond_dim

        self.net = nn.Sequential(
            nn.Linear(in_dim, hidden_dim),
            nn.SiLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.SiLU(),
            nn.Linear(hidden_dim, hidden_dim),
            nn.SiLU(),
            nn.Linear(hidden_dim, chunk_dim),
        )

    def forward(self, x_t, t, cond):
        t_emb = self.time_emb(t)
        x = torch.cat([x_t, t_emb, cond], dim=-1)
        return self.net(x)


class DiffusionHead(nn.Module):
    def __init__(self, cfg: DiffusionConfig):
        super().__init__()

        self.cfg = cfg
        self.denoise_model = ActionDenoiseModel(cfg)

        betas, alphas, alpha_bar = make_beta_schedule(cfg)

        self.register_buffer("betas", betas)
        self.register_buffer("alphas", alphas)
        self.register_buffer("alpha_bar", alpha_bar)

    def q_sample(self, x0, t, noise):
        alpha_bar_t = self.alpha_bar[t].unsqueeze(-1)
        return torch.sqrt(alpha_bar_t) * x0 + torch.sqrt(1 - alpha_bar_t) * noise

    def loss(self, actions, cond):

        B = actions.size(0)

        actions_flat = actions.view(B, -1)

        t = torch.randint(0, self.cfg.T, (B,), device=actions.device)

        noise = torch.randn_like(actions_flat)

        x_t = self.q_sample(actions_flat, t, noise)

        eps_pred = self.denoise_model(x_t, t, cond)

        return F.mse_loss(eps_pred, noise)

    @torch.no_grad()
    def sample(self, cond):

        self.eval()

        B = cond.size(0)

        chunk_dim = self.cfg.action_dim * self.cfg.action_horizon

        x_t = torch.randn(B, chunk_dim, device=cond.device)

        for t_step in reversed(range(self.cfg.T)):

            t = torch.full((B,), t_step, device=cond.device, dtype=torch.long)

            eps_pred = self.denoise_model(x_t, t, cond)

            beta_t = self.betas[t_step]
            alpha_bar_t = self.alpha_bar[t_step]
            alpha_t = self.alphas[t_step]

            x0_pred = (x_t - torch.sqrt(1 - alpha_bar_t) * eps_pred) / torch.sqrt(alpha_bar_t)
	
            if t_step > 0:
                x_t = torch.sqrt(alpha_t) * x0_pred + torch.sqrt(beta_t) * torch.randn_like(x_t)
            else:
                x_t = x0_pred

        return x_t.view(B, self.cfg.action_horizon, self.cfg.action_dim)
```

This is the most involved component, but its role can be understood through the denoising objective. (it was hard for me too since this is my first time with diffusion too) But, all you need to understand is the core idea behind it and it's done!

The diffusion head consists of two main components: a **denoising network** and the **diffusion process itself**. The denoising network is a small MLP that takes three inputs: a noisy action trajectory, a timestep embedding that tells the model how much noise is present, and the multimodal context representation produced by the fusion module. Its job is to predict the **noise inside the action chunk**.

During training, we take the ground truth action trajectory and add Gaussian noise to it using a predefined noise schedule. The model then learns to predict the noise that was added. This is done using a simple mean squared error loss between the predicted noise and the true noise.

At inference time, the process is reversed. We start from random noise and repeatedly apply the denoising model over several steps. At each step, the model removes a small amount of noise until a clean action trajectory emerges.

Instead of predicting a single action, the model predicts a **chunk of future actions at once**. This helps produce smoother motion and reduces the compounding errors that can occur when predicting actions one step at a time.

The final output of this diffusion head is therefore a short **sequence of robot actions**, which the robot can execute in the environment.

---
# Building the VLA

Now all we need is to combine the whole pipeline! 
This pipeline is one of the early methods, the main code is gonna be a little different soon. I'd surely update some of the things in newer articles like Flow Matching and Diffusion too but for now this is all you get ffor someone trying to build their own VLA!

```python
import torch
import torch.nn as nn

from encoders.vision_encoder import VisionEncoderResnet18
from encoders.text_encoder import TextEncoderDistilbert
from encoders.state_encoder import StateEncoderMLP
from fusion import FusionTransformer
from action_head.diffusion_head import DiffusionHead, DiffusionConfig


class VlaDiffusion(nn.Module):
    def __init__(self, state_dim, action_dim, d_model=256, diffusion_steps=16, action_horizon=16):
        super().__init__()

        self.action_horizon = action_horizon

        self.vision_encoder = VisionEncoderResnet18(d_model=d_model)
        self.text_encoder   = TextEncoderDistilbert(d_model=d_model)
        self.state_encoder  = StateEncoderMLP(state_dim=state_dim, d_model=d_model)
        self.fusion         = FusionTransformer(d_model=d_model)

        cfg = DiffusionConfig(
            T=diffusion_steps,
            action_dim=action_dim,
            action_horizon=action_horizon,
            cond_dim=d_model,
        )
        self.diffusion_head = DiffusionHead(cfg)
        self._text_cache = {}

    def encode_observations(self, image, input_ids, attention_mask, state):
        key = input_ids.sum().item()
        if key not in self._text_cache:
            self._text_cache[key] = self.text_encoder(input_ids, attention_mask)
            
        text_tokens = self._text_cache[key].expand(image.size(0), -1, -1)
        vision_tokens = self.vision_encoder(image)
        state_tokens  = self.state_encoder(state)
        
        return self.fusion(vision_tokens, text_tokens, state_tokens)

    def loss(self, image, input_ids, attention_mask, state, action):
        cond = self.encode_observations(image, input_ids, attention_mask, state)
        return self.diffusion_head.loss(action, cond)

    def act(self, image, input_ids, attention_mask, state):
        cond = self.encode_observations(image, input_ids, attention_mask, state)
        return self.diffusion_head.sample(cond)
```

## Final Thoughts

This project started as a simple question:  
**can I build a small Vision-Language-Action model that actually works on limited hardware?**
The answer, at least from this first version, is **yes — to an extent**. The model can perform simple tasks pretty well .

Even with a constrained setup (RTX 3050, small models, short training runs), the system is able to:
- combine visual observations and language instructions into a shared representation
- condition actions on both the task and the robot’s current state
- produce smoother, multi-step behaviors using a diffusion-based policy
- all that while consuming less than 1GB VRAM

Got it — that changes the direction completely. You’re not trying to **remove modularity**, you’re trying to **lean into it for experimentation**.

Here’s the corrected version:

---

## Future Work

- Integrate components from different VLA and policy papers into a single modular framework for rapid experimentation
- Swap and benchmark different encoders, fusion strategies, and action heads within the same pipeline like ACT, RT-1, RT-2 Pi-0 etc so we can experiment VLA behaviours over different architectures.
- Experiment with alternative policy heads (diffusion, autoregressive, regression) under a unified interface
- Improve multimodal alignment while keeping components interchangeable
- Expand evaluation across tasks to understand how different design choices affect performance
## Closing


Building this on limited hardware forced trade-offs, but also made the design more explicit and interpretable.

Future versions will likely look very different — larger models, better data, cleaner abstractions — but this was a solid starting point to understand how these systems actually come together.

---

If you want, I can also add a **1-paragraph punchy ending** (the kind that sticks in people’s heads / good for recruiters).