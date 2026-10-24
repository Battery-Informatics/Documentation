# Variable and Multi-Composition

Fixed composition asks where the atoms go. Variable composition asks what the
atoms should be as well — a much larger question, and the one that matters for
discovery rather than confirmation. This page covers those runs and the
multi-composition searches that followed.

## Variable composition

With the baseline established, the search was opened up to explore
stoichiometry alongside structure.

### The first attempt

<!-- PLACEHOLDER: what the unconstrained variable-composition runs produced
     and why the results were not usable. -->

### Constraints

Variable composition enlarges the search space enormously. Fixed composition
searches arrangements of a known atom set; variable composition searches
arrangements *and* compositions, so an unconstrained run spends most of its
budget in regions that cannot produce a useful cathode at all.

<!-- PLACEHOLDER: the constraints identified — atom count limits, operator
     weights, and any others — with the values settled on and the reasoning. -->

### Re-run

<!-- PLACEHOLDER: outcome of the constrained variable-composition run, and how
     it compared to the first attempt. -->

## Multi-composition

Stock XtalOpt accepts one chemical system per run, so comparing dopant
substitutions around the baseline meant a separate job for each — separate
queue, separate compute budget, and no shared bookkeeping. The extended
composition input removes that restriction; the mechanism is described in
[Composition Input](/implementation/composition).

### Setup

<!-- PLACEHOLDER: the dopant set searched, how it was expressed in the input,
     and the run configuration. -->

### Results

<!-- PLACEHOLDER: what was recovered for each substitution, the per-group
     convex hulls, and the comparison against running the systems separately. -->

### Objective values

<!-- PLACEHOLDER: the voltage objective values obtained across the dopant
     systems, and what they indicate about the substitutions. -->

## What this established

<!-- PLACEHOLDER: conclusions carried forward about composition search and
     dopant comparison. -->
