# Paper taxonomy

Single reference for `topic` and `tags` on papers. Pick from these — don't invent new ones unless you add them here first.

## Topics (big bubbles on graph)

One per paper. Coarse grouping only.

- **Model-Free RL** — policy gradients, Q-learning, ES, curiosity, HITL, random search
- **Model-Based RL** — Dyna, world models, GPS, visual planning, dynamics models
- **Imitation Learning** — BC, visual IL, causal confusion, transporter
- **Exploration** — only when exploration is the main point (optional; most go under Model-Free RL)

`offline-rl` / `online-rl` are **keywords**, not topics — until you have 5+ offline papers.

## Keywords (small nodes — papers cluster here)

Pick 2–4 per paper. These create connections on the graph.

### Application
- `manipulation`
- `dexterous`
- `grasping`
- `pick-and-place`
- `locomotion`

### Perception / representation
- `visual`
- `representation-learning`
- `video-prediction`
- `autoencoders`
- `spatial-attention`

### Method
- `exploration`
- `intrinsic-motivation`
- `planning`
- `world-model`
- `policy-search`
- `trajectory-optimization`
- `evolution-strategies`
- `q-learning`
- `goal-conditioned`
- `value-functions`
- `self-supervised`
- `human-in-the-loop`
- `bandits`
- `hybrid` — mixes model-based + model-free

### Problem / setting
- `sample-efficiency`
- `causal-inference`
- `covariate-shift`
- `generalization`
- `transfer`
- `online-rl`
- `offline-rl`

## Do NOT use as tags

These duplicate `topic` or are too vague to cluster on:

- `rl`, `imitation-learning`, `model-based-rl`, `model-free`
- `optimization`, `deep-learning`, `critique`, `scalability`, `hitl`
