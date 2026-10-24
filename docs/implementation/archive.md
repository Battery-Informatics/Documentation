# Grid Archive

The archive is what replaces XtalOpt's parent pool under MOME. Instead of one
ranked list of the best structures, it is a two-dimensional grid of behavioural
niches, each holding its own small set of non-dominated trade-offs. This page
covers how it is built and how structures enter it.

## Shape of the archive

The two configured descriptors become the two axes. Each is divided into bins,
and every pair of bins is a **cell** — one behavioural niche.

```
optimizationType = mome
momeGridXBins = 10
momeGridYBins = 10
```

Ten bins per axis gives a 10 × 10 grid, so 100 niches. Each cell holds a
bounded Pareto set with a capacity of ten structures, so the archive tops out
at a thousand retained candidates — but in practice most cells sit empty for
much of a run, and the proportion that fill is itself the measure of how well
the search is illuminating the space.

The grid is stored as `MOMEGrid`, a `QVector<QVector<MOMECell>>` indexed `[x][y]`,
with `MOMECell` wrapping a `ParetoSet` of structure pointers.

## Mapping a structure to a cell

A descriptor value is normalised against its configured bounds and floored to a
bin index:

$$\text{bin} = \left\lfloor \frac{v - v_{\min}}{v_{\max} - v_{\min}} \times n_{\text{bins}} \right\rfloor$$

Both descriptors are mapped this way, giving the cell coordinates $(x, y)$.

Three details matter:

**The upper bound is a special case.** A value exactly equal to $v_{\max}$ would
floor to `numBins`, one past the end, so it is mapped explicitly to the last
bin.

**Out-of-range values are rejected, not clamped.** If $v < v_{\min}$ or
$v > v_{\max}$ the mapping fails and the structure does not enter the archive at
all. This is deliberate — clamping would pile every extreme structure into the
edge bins and misrepresent the behaviour space — but it does mean badly chosen
bounds silently discard candidates. See
[Descriptors](/implementation/descriptors).

**Non-finite values fail closed.** A `NaN` or infinity in the value or either
bound causes the mapping to fail rather than produce a nonsense index.

## What happens inside a cell

Reaching a cell does not guarantee a place in it. The cell holds a Pareto set,
and the candidate must earn its slot on objectives.

Dominance uses the standard definition — with all objectives oriented so lower
is better, $a$ dominates $b$ when it is at least as good on every objective and
strictly better on at least one:

$$a \prec b \iff \forall i:\ f_i(a) \le f_i(b)\ \ \wedge\ \ \exists j:\ f_j(a) < f_j(b)$$

Insertion proceeds in four steps:

**1. Reject on invalid input.** An empty objective vector, any non-finite
objective value, or a dimensionality that disagrees with the entries already in
the cell — all cause an immediate rejection.

**2. Reject if dominated.** If any current member of the cell dominates the
candidate, it is turned away. It is worse than something already occupying this
niche on every count.

**3. Displace what it dominates.** If the candidate survives, any existing
members that *it* dominates are dropped. This is what keeps each cell's
contents mutually non-dominated.

**4. Evict if over capacity.** After insertion, if the cell exceeds its capacity
of ten, the member with the smallest **crowding distance** is removed. Crowding
distance measures how isolated a point is among its neighbours along the Pareto
front, so the member discarded is the one sitting in the most densely populated
part of the front — the one whose trade-off is most nearly represented by
others. The extremes of the front are preserved.

This is the only place crowding distance is used in the archive. It settles
eviction, nothing else — notably not selection, which is covered in
[Parent Selection](/implementation/selection).

## Where insertion happens in the pipeline

A structure reaches the archive only after it has been fully evaluated. The
handoff point is `insertIntoMomeArchiveIfReady()`, called once a structure's
objectives and descriptors are finalised. It does nothing unless:

- MOME is the active optimisation type,
- the structure's descriptor state is `Ds_Retain` and exactly two values are
  present, and
- the structure has at least one optimisable objective.

Objective values are assembled with the same sign convention used by
whole-population Pareto selection, so that minimised and maximised objectives
compare consistently inside the archive regardless of their declared direction.

They are deliberately **not normalised**. The normalisation XtalOpt applies
during population-wide Pareto selection rescales against the current
population, which is meaningless for a single structure being inserted on its
own — and dominance comparisons are unaffected by omitting it, since scaling
each objective monotonically cannot change which of two points dominates.

## Configuration summary

| Key | Value used | Effect |
|---|---|---|
| `optimizationType` | `mome` | Selects archive-based search; default is `basic` |
| `momeGridXBins` | `10` | Bins along descriptor 0 |
| `momeGridYBins` | `10` | Bins along descriptor 1 |
| Cell capacity | `10` | Structures retained per niche |

A MOME run is refused unless exactly two descriptors are configured, since the
grid has two axes.
