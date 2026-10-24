# Baseline Validation

Before any claim can be made about an unknown material, the search has to be
shown to recover a known one. This page covers the fixed-composition runs on
LiNiMnCoO₂ that establish that baseline.

## Why this run comes first

A crystal structure search is only as trustworthy as the machinery underneath
it. Three things have to be right at once: the interatomic potential, the
relaxation pipeline, and the evolutionary loop. A failure in any of them
produces a run that completes normally and reports structures that mean
nothing.

Rediscovery tests all three together. Starting from nothing but a composition —
no symmetry hint, no structural template — the search should converge on the
arrangement that is already known experimentally. If it does, the setup is
sound. If it does not, nothing found on an unknown system can be believed.

## Method

The search was given the composition and the atom-count limits, and left to
generate, relax and rank structures without further guidance. Both USPEX and
XtalOpt were run so that the result did not depend on one code's behaviour.

<!-- PLACEHOLDER: run configuration — composition, cell size, population
     settings, number of structures generated, and the GULP potential used. -->

## Recovered structure

<!-- PLACEHOLDER: the structure the search converged on, its space group and
     lattice parameters, and a render. State how it compares to the known
     layered arrangement described in background/nmc. -->

## Stability ranking

Structures are ranked by enthalpy per atom, and for runs spanning more than one
composition by distance above the convex hull — the energy difference between a
structure and the most stable combination of phases at its composition. A
structure on the hull is thermodynamically stable; one above it can decompose
into the phases below.

<!-- PLACEHOLDER: hull plot and the table of lowest-enthalpy structures. -->

## Expert validation

<!-- PLACEHOLDER: the assessment of the recovered structure as synthesizable
     and electrochemically relevant, and what that confirmed. -->

## What this established

<!-- PLACEHOLDER: the conclusions carried forward — which parts of the setup
     were confirmed sound, and what was taken as settled for subsequent runs. -->
