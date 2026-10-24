# Experiment Log

The work proceeded as a sequence of runs, each answering one question and
setting up the next. Several produced poor results; those runs are recorded
here too, because what they exposed shaped the configuration everything after
them used.

The order below is the order the work happened in.

## 1. Baseline validation

**Question.** Can the tooling rediscover a structure that is already known?

Before trusting either code on an unknown system, both USPEX and XtalOpt were
run on LiNiMnCoO₂ in fixed composition — starting from the composition alone,
with no structural hint — to see whether the search converged on the known
layered arrangement.

This is the run that validates everything downstream: the forcefield setup, the
relaxation pipeline, and the evolutionary loop itself. If a known structure
cannot be recovered, nothing found on an unknown system is believable.

<!-- PLACEHOLDER: outcome of the fixed-composition baseline on both codes.
     Recovered structure, how it compares to the known layered arrangement,
     and the structure render. -->

Covered in detail on [Baseline Validation](/results/stability).

## 2. First variable-composition attempt

**Question.** With the baseline confirmed, can the same setup search composition
and structure at once?

Variable composition was attempted on both codes. The results were not usable.

<!-- PLACEHOLDER: what specifically went wrong — what the runs produced and
     why it was judged unusable. -->

## 3. Diagnosing the constraints

**Question.** Why did variable composition fail where fixed composition
succeeded?

Re-running the search made the cause clear: the run had been under-constrained.
Variable composition opens a far larger space than fixed composition, and
without limits on quantities such as the number of atoms per cell, the search
spends its budget in regions that cannot yield a useful cathode.

<!-- PLACEHOLDER: the specific constraints identified and the values settled
     on — atom count limits, operator weights, and anything else that changed
     between the failed and working configurations. -->

This produced the constraint set used by every run that followed.

## 4. Variable composition, re-run

**Question.** Does variable composition work once properly constrained?

The search was repeated with the constraints from the previous step.

<!-- PLACEHOLDER: outcome of the constrained variable-composition run. -->

Covered on [Variable and Multi-Composition](/results/composition).

## 5. Multi-composition input

**Question.** Can several dopant systems be searched in a single run?

Stock XtalOpt accepts one chemical system per run, so comparing dopant
substitutions meant one job per dopant. With the extended composition input —
see [Composition Input](/implementation/composition) — the substitutions were
given to a single run, each keeping its own reference energies and convex hull
while sharing one queue and one compute budget.

<!-- PLACEHOLDER: the dopant set searched, what was recovered for each, and
     the comparison against running them separately. -->

Covered on [Variable and Multi-Composition](/results/composition).

## 6. MOQD integration

**Question.** Does the behaviour-space archive populate, and does it hold
structures a ranked pool would have discarded?

The MOME archive was exercised end to end: descriptors computed per structure,
candidates mapped to grid cells, Pareto sets maintained within each cell, and
parents drawn from the archive rather than from a fitness-ranked pool.

<!-- PLACEHOLDER: archive occupancy, how descriptor values distributed across
     the grid, and what this showed about the configured descriptor bounds. -->

Covered on [MOQD Archive](/results/pareto).

## 7. Full run

**Question.** What does the complete pipeline produce?

The final run combined the pieces: the extended composition input, the
objectives, and the search machinery, on the target system.

<!-- PLACEHOLDER: configuration and outcome of the full run. -->
