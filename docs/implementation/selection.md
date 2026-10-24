# Parent Selection

Selection decides which structures get to reproduce, and it is the point where
MOME diverges most sharply from stock XtalOpt. The archive replaces the ranked
parent pool, and with it the notion that some structures are simply better
parents than others.

## How XtalOpt selects normally

Stock XtalOpt maintains an in-memory **parent pool**: optimised structures with
their hull distance and objectives computed, not marked similar to anything
already found. The pool is trimmed to the best $N$ by fitness, and a parent is
drawn from it by one of several schemes — a scalar weighted-sum fitness, or
Pareto ranking with optional crowding distance, drawn either by roulette or by
binary tournament.

Every one of those schemes shares an assumption: structures can be placed on a
single quality ordering, and the better ones should be sampled more often. That
is exactly the assumption that erodes diversity. Low-energy structures that
resemble each other dominate the pool, are selected repeatedly, and crowd out
the metastable candidates a cathode search most wants to keep.

## How MOME selects

MOME discards the ordering entirely. Selection is two uniform draws:

$$P(C) = \frac{1}{|\mathcal{O}|}\ \ \text{for } C \in \mathcal{O},
\qquad P(s \mid C) = \frac{1}{|C|}$$

**First a cell, then a structure within it.** Every occupied cell $C$ in the set
of occupied cells $\mathcal{O}$ is equally likely, and every member of the
chosen cell is equally likely.

The implementation walks the grid collecting occupied coordinates, picks one at
random, and picks a random member of the Pareto set it holds. If no cell is
occupied it returns nothing and the caller falls back to random generation.

### Why uniform over cells, not over structures

This is the design decision that makes the method work, and it is easy to get
wrong. Selecting a uniformly random *structure* from the archive would give
densely populated cells proportionally more influence — a niche holding ten
structures would be picked ten times as often as a niche holding one.

Selecting a uniformly random *occupied cell* gives every discovered niche equal
selection pressure regardless of how many structures happen to sit in it. A
sparsely occupied region of behaviour space gets the same attention as a
crowded one, which is the whole point of the grid: illumination, not
optimisation.

### Crowding distance is not used here

Crowding distance plays no part in selection. It appears in exactly one place
in the archive — deciding which member is evicted when a cell is over capacity,
as described in [Grid Archive](/implementation/archive). Selection itself is
uniform at both levels.

## Where it plugs in

The integration is deliberately narrow. `selectParentStructure()` checks the
active optimisation type and, under MOME, delegates to
`selectParentFromMomeArchive()`, bypassing the pool, Pareto and scalar
machinery entirely. Everything downstream is untouched:

```
XtalOpt::selectXtalFromProbabilityList()
        └── SearchBase::selectParentStructure()
                 ├── MOME      → selectParentFromMomeArchive()   [archive]
                 └── otherwise → pool / Pareto / scalar fitness   [stock]
```

`selectXtalFromProbabilityList()` is called once per offspring, and **twice for
crossover** — once per parent. Under MOME both draws come from the archive
independently, so a crossover can and frequently does combine parents from two
different behavioural niches. That is a useful property: it recombines
structures that a pool-based search would rarely pair, because they are not
both near the top of a single ranking.

The archive is read under a read lock, since structures are inserted from the
evaluation path while selection runs on the generation path.

## Evolutionary settings

Selection interacts with the operator weights, which are unchanged from stock
XtalOpt:

| Setting | Value | Notes |
|---|---|---|
| `numInitial` | 20 | Random structures seeded before evolution begins |
| `parentsPoolSize` | 20 | Pool size; unused under MOME but still validated |
| `maxNumStructures` | 100 | Total candidates generated per run |
| `weightCrossover` | 35 | |
| `weightStripple` | 25 | |
| `weightPermustrain` | 25 | |
| `weightPermutomic` | 15 | Variable-composition searches only |
| `weightPermucomp` | 5 | Variable-composition searches only |

In a fixed-composition run the last two are excluded, so only crossover,
stripple and permustrain are ever applied.

The bootstrap phase is unchanged: until enough optimised structures exist, new
candidates are generated at random rather than selected. Under MOME this is
also what happens whenever the archive is still empty.
