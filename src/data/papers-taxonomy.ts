// Canonical topics + keywords for the papers graph.
// Keep in sync with src/content/Templates/Paper Keywords.md

export const PAPER_TOPICS = [
	'Model-Free RL',
	'Model-Based RL',
	'Imitation Learning',
	'Exploration',
] as const;

export const PAPER_KEYWORDS = [
	// application
	'manipulation',
	'dexterous',
	'grasping',
	'pick-and-place',
	'locomotion',
	// perception / representation
	'visual',
	'representation-learning',
	'video-prediction',
	'autoencoders',
	'spatial-attention',
	// method
	'exploration',
	'intrinsic-motivation',
	'planning',
	'world-model',
	'policy-search',
	'trajectory-optimization',
	'evolution-strategies',
	'q-learning',
	'goal-conditioned',
	'value-functions',
	'self-supervised',
	'human-in-the-loop',
	'bandits',
	'hybrid',
	// problem / setting
	'sample-efficiency',
	'causal-inference',
	'covariate-shift',
	'generalization',
	'transfer',
	'online-rl',
	'offline-rl',
] as const;

export type PaperTopic = (typeof PAPER_TOPICS)[number];
export type PaperKeyword = (typeof PAPER_KEYWORDS)[number];
