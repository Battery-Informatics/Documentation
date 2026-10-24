# MOQD Archive

The archive is the central addition this project makes to XtalOpt. This page
covers what the MOME runs showed: whether the archive populates, how structures
distribute across behaviour space, and what that reveals about the
configuration.

## What the runs were testing

Three things, in order of how fundamental they are:

**Does the machinery work end to end?** Descriptors computed per structure,
values mapped to grid cells, Pareto sets maintained inside each cell, parents
drawn from the archive instead of a ranked pool — every stage exercised on real
structures rather than in tests.

**Does the archive illuminate?** A grid that fills only a handful of cells is
not maintaining diversity, whatever the algorithm is doing internally.
Occupancy across the grid is the direct measure of whether behaviour space is
being explored.

**Are the descriptors well chosen?** A descriptor only contributes diversity if
its values spread across its configured range. One whose values cluster into a
single bin adds an axis to the grid without adding anything to the search.

## Archive occupancy

<!-- PLACEHOLDER: how many of the grid cells were occupied, how occupancy
     developed over the run, and an occupancy heatmap. -->

## Descriptor distribution

The grid can only be as informative as its axes. Each descriptor's configured
bounds determine what a bin covers, and values falling outside those bounds are
rejected rather than clamped — so bounds set too wide collapse structures into
a few central bins, and bounds set too narrow discard candidates outright.

<!-- PLACEHOLDER: the observed range of each descriptor against its configured
     bounds, the resulting bin distribution, and what this implies for how the
     bounds should be set. -->

## Pareto fronts within cells

Each occupied cell holds its own set of mutually non-dominated structures — the
trade-offs available within that region of behaviour space, rather than a
single winner.

<!-- PLACEHOLDER: the contents of representative cells, and the objective
     trade-offs they span. -->

## Comparison against ranked selection

The claim MOME makes is that a behaviour-space archive retains structures a
fitness-ranked pool would discard. Testing that requires running the same
system both ways and comparing what survives.

<!-- PLACEHOLDER: comparison between an archive-based run and a baseline run on
     the same system — diversity retained, quality reached, and the trade-off
     between them. -->

## What this established

<!-- PLACEHOLDER: conclusions about the archive implementation and what
     remains to be settled. -->
