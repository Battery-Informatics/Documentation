# MOME — Multi-Objective MAP-Elites

This page explains the algorithm this project adds to XtalOpt: what
quality-diversity optimisation is, how it differs from ordinary optimisation,
and why it suits cathode discovery. For how it is actually implemented, see the
Implementation section.

## Illumination, not minimisation

Conventional optimisation converges on a single best point. For crystal
structure prediction that means the lowest-energy structure — the global minimum
of the potential energy surface — and everything else the search found is
discarded along the way.

Quality-diversity (QD) algorithms reframe the task. Instead of asking *what is
the single best solution?*, they ask **what is the best solution for each kind
of solution?** The output is not one answer but a collection of them, each the
best of its own category, spread deliberately across the space of possible
behaviours. This is often called **illumination**: the algorithm lights up the
whole landscape rather than drilling into one point of it.

That reframing matters here because the lowest-energy structure is not
necessarily the most useful material. A metastable structure — one sitting
slightly above the ground state — can outperform it on ionic conductivity or
cycle stability, and a conventional search throws exactly those candidates away.

## Objectives and descriptors

QD depends on a separation between two different things a structure can be
measured on.

**Objectives** are what you want to maximise or minimise — quality. Lower
formation energy is better; higher voltage is better. Objectives decide whether
a structure is *good*.

**Behaviour descriptors** are what you want to vary — diversity. These are
measurable structural or physical traits that characterise *what kind* of
structure something is, without any notion of better or worse. A structure is
not good or bad for having a particular density; it simply has one.

The division of labour is the core idea, and it is worth stating as a rule:

> **Descriptors choose where a structure is filed. Objectives choose whether it
> survives there.**

Because the two are kept separate, a structure that would lose outright on
objectives can still earn a place in the archive, provided its descriptors put
it somewhere nothing else occupies. That is what preserves diversity across
generations instead of letting it decay.

## MAP-Elites and the archive

MAP-Elites implements this with a grid. The descriptor space is discretised into
cells — each cell a distinct region of behaviour, a *niche* — and the algorithm
keeps the best structure found so far in each one.

**MOME** (Multi-Objective MAP-Elites) generalises this to more than one
objective. With a single objective, "best in this cell" is unambiguous. With
several that conflict, there is no single best; there is a *set* of mutually
non-dominated trade-offs. So each cell holds not one elite but a bounded Pareto
set.

Dominance is the standard definition. For objectives $f_1 \ldots f_m$ all being
minimised, solution $a$ dominates $b$ when:

$$a \prec b \iff \forall i:\ f_i(a) \le f_i(b)\ \ \wedge\ \ \exists j:\ f_j(a) < f_j(b)$$

— that is, $a$ is at least as good on every objective and strictly better on at
least one. Solutions that dominate each other in neither direction are
**mutually non-dominated**: each wins on something, so none can be discarded on
objective grounds alone.

The resulting structure is a grid of Pareto sets. Every cell illuminates one
behavioural niche and, within it, retains the full range of trade-offs between
the competing objectives.

![The MOME loop: a MAP-Elites grid of behavioural cells feeds Pareto front selection, then individual selection, variation, relaxation and evaluation, with the result added back to a cell's Pareto front and thence to the grid](/images/map-elites.png)

*The MOME loop applied to crystal structure prediction. The grid at the left is
the archive — each square a behavioural niche, shading showing quality. A cell
is chosen, a structure drawn from the Pareto front it holds, varied, relaxed
and evaluated; the result is offered back to the Pareto front of whichever cell
its descriptors place it in, and the archive updates. The surrogate evaluation
step shown here is specific to that paper's method — our implementation
evaluates directly. Figure from [Janmohamed et al., GECCO 2024][moqd-paper].*

## The trade-off, concretely

The clearest published example comes from the paper that applied MOQD to crystal
structure prediction. Two objectives are in tension:

- **Stability** (low energy) — whether the material can physically exist.
- **Magnetism** — a functional property of interest.

Increasing magnetism raises energy. Lowering energy reduces magnetism. Neither
objective can be improved without giving up the other, so there is no single
right answer — only a frontier of them.

What MOQD produces is a set of structurally distinct materials spanning that
frontier: some stable and weakly magnetic, some strongly magnetic and
marginally stable, and a range in between, each occupying a different region of
behaviour space.

Our project substitutes the objectives — formation energy and voltage — but the
shape of the problem is identical.

## Why this fits cathode discovery

A cathode must do several things at once that pull in different directions.
Capacity, voltage, cycle life and cost cannot all be maximised simultaneously;
improving one typically costs another. There is no single best cathode, only a
set of defensible compromises.

Three properties of QD make it the right tool:

**It treats diversity as a first-class goal** rather than a side effect.
Conventional Pareto selection still collapses population diversity over
generations, because structurally similar low-energy candidates crowd out
everything else. Discretising behaviour space prevents that by construction —
a structure in an unoccupied niche cannot be crowded out, because it has no
competition there.

**It keeps metastable candidates.** These are exactly the structures that a
single-objective search discards and that may matter most for conductivity or
cycle stability.

**It returns a portfolio, not a point.** Experimental validation is slow and
expensive, so what is actually wanted from a computational screen is a ranked
shortlist of genuinely different candidates — not one structure with no
alternatives if it fails.

## References

- Janmohamed, H., Wolinska, M., Surana, S., Pierrot, T., Walsh, A., & Cully, A.
  — *Multi-Objective Quality-Diversity for Crystal Structure Prediction*, GECCO
  2024, 1273–1281. [DOI](https://doi.org/10.1145/3638529.3654048)
- Cully, A., & Demiris, Y. — *Quality and Diversity Optimization: A Unifying
  Modular Framework*, IEEE Transactions on Evolutionary Computation, **22**(2),
  245–259, 2018. [DOI](https://doi.org/10.1109/TEVC.2017.2704781)
- Pierrot, T., Richard, G., Beguir, K., & Cully, A. — *Multi-Objective Quality
  Diversity Optimization*, arXiv:2202.03057, 2022.
  [arXiv](https://arxiv.org/abs/2202.03057)
- Janmohamed, H., Pierrot, T., & Cully, A. — *Improving the Data Efficiency of
  Multi-Objective Quality-Diversity through Gradient Assistance and Crowding
  Exploration*, 2023. [DOI](https://dl.acm.org/doi/10.1145/3583131.3590470)
- Wolinska, M., Walsh, A., & Cully, A. — *Illuminating the property space in
  crystal structure prediction using Quality-Diversity algorithms*,
  arXiv:2403.03511, 2024. [arXiv](https://arxiv.org/abs/2403.03511)

## Figure sources

- **The MOME loop** — [Janmohamed, H., Wolinska, M., Surana, S., Pierrot, T.,
  Walsh, A., & Cully, A., *Multi-Objective Quality-Diversity for Crystal
  Structure Prediction*, GECCO 2024][moqd-paper].

[moqd-paper]: https://doi.org/10.1145/3638529.3654048
