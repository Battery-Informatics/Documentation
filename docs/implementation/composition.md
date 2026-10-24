# Composition Input

Stock XtalOpt accepts one chemical system per run. Every formula in the input
has to contain the same set of elements, which is a hard constraint when the
search question is *which dopant works best*. This page covers two extensions
that lift it, in different directions.

## The limitation

The baseline material is LiNiMnCoO₂. Replacing cobalt with aluminium gives
LiNiMnAlO₂ — a different element set, not a different ratio. Stock XtalOpt
cannot take both in one run, so testing four dopants meant four separate jobs,
four queues and four compute budgets.

Two mechanisms address this. **Composition groups** let one run search several
distinct chemical systems side by side. **Mixed-site patterns** let a single
formula stand for a family of stoichiometries over a shared site.

::: info
Both extensions live on their own branches and are not yet merged with the
MOME archive work described elsewhere in this section.
:::

## Composition groups

A group is one chemical system. Groups are separated by a semicolon, and within
a group the existing comma-separated formula syntax is unchanged:

```
chemicalFormulas = LiNiO2, Li2NiO4 ; LiAlO2, Li2AlO3
```

Parsing splits on `;` first, then processes each group as before. Every formula
within a group is validated to share exactly the same element set — a group is
a chemical system, so a mismatch is an input error rather than a new group.

Each group is stored as a `CompGroup`:

| Field | Contents |
|---|---|
| `comps` | The group's parsed compositions |
| `chemSystem` | Its element symbols, sorted |
| `refEnergies` | Reference energies for this group's hull |

The parser produces the group list plus a flattened composition list, and
rebuilds the minimum-radii table over the **union** of elements across all
groups, so radius checks work for every system in the run.

### What becomes group-aware

Separating the input is the easy part. Three things downstream have to respect
the division.

**Structures carry a group index.** Every structure records which `CompGroup`
it belongs to, assigned on creation or recovered by matching its composition.

**Genetic operators stay within a group.** When an offspring is produced, the
composition list passed to the operator is the parent's own group's list rather
than the global one. This is not an optimisation — it is a requirement.
Crossover recombines slabs of two parents, so two parents from different
element sets would produce a composition belonging to neither.

**The convex hull is computed per group.** With more than one group,
`updateHullAndFrontInfo()` partitions structures by group index and builds a
separate hull for each, using that group's own element set and reference
energies. Stability is only meaningful relative to the chemical system a
structure belongs to; a single hull across four dopant systems would compare
quantities that are not comparable.

So what is actually shared across groups is orchestration — one job, one queue,
one compute budget — rather than genetics. Each system keeps its own parent
pool, reference energies and hull.

## Mixed-site patterns

The second mechanism addresses a different question: not several separate
systems, but one system in which a site is shared between elements, as in a
solid solution.

```
chemicalFormulas = Li1(Mn,Ni,Co)1O2
fractionalBounds = Mn 0.1 0.6, Ni 0.1 0.6, Co 0.1 0.6
minAtoms = 4
maxAtoms = 12
```

The parenthesised group means *one site shared between Mn, Ni and Co*, and the
run explores how to divide it.

### Parsing

Commas inside parentheses must not split the formula list, so the input is
split on commas **at parenthesis depth zero** only. Each resulting formula is
then matched against

```
([A-Z][a-z]?|\([A-Za-z,]+\))(\d*)
```

giving a `CompositionPattern` — a list of groups, each with its element list
and a count. A parenthesised token yields a multi-element group; a bare symbol
yields a single-element one. If the matched text does not cover the whole
string the pattern is rejected, so malformed input fails rather than being
silently truncated.

### Expansion

A pattern is a template, not a composition. Expanding it:

1. Sum the group counts to get the atoms per formula unit.
2. Loop over multipliers from `ceil(minAtoms / base)` to `maxAtoms / base`, so
   every expansion lands inside the configured atom-count range.
3. For each group at that multiplier, enumerate the **integer partitions** of
   its atom count across its elements, every element receiving at least one
   atom.
4. Take the Cartesian product of the per-group partitions.
5. Filter each candidate against `fractionalBounds`.

`fractionalBounds` constrains an element's share of its own group, not of the
cell. For `Mn 0.1 0.6`, a candidate is kept only when manganese holds between
10% and 60% of the atoms on the shared site. This is what keeps the expansion
to chemically sensible ratios instead of enumerating everything combinatorially
possible.

### Ranges

The hyphen range syntax extends to patterns. Both sides are parsed, and
`comparePatterns()` returns the integer ratio between them — requiring the same
groups with the same elements in the same order, and a consistent ratio across
every group. A mismatch or a non-integer ratio is an input error. The ratio
then sets the upper atom count for expansion.

## Comparison

| | Composition groups | Mixed-site patterns |
|---|---|---|
| Separator | `;` between groups | `( )` within a formula |
| Expresses | Several distinct chemical systems | One system, a shared site |
| Element sets | Different per group | Single set throughout |
| Hulls | One per group | One |
| Operators | Confined to a group | Unrestricted |
| Extra config | — | `fractionalBounds` |

They are complementary rather than alternatives. Groups answer *which dopant*;
patterns answer *in what proportion*.

<!-- TODO: neither branch is merged into the MOME work. Decide the merge order
     and whether the two composition mechanisms should be unified behind one
     parser before either lands. -->
